import { existsSync } from "fs";
import puppeteer from "puppeteer-core";
import { asyncHandler } from "../../lib/async-handler";
import { HttpError } from "../../lib/http-error";
import { paginationSchema } from "../../lib/pagination";
import {
  createPatient,
  deletePatient,
  getDashboardSummary,
  getPatientById,
  getPatientReport,
  listPatients,
  updatePatient,
} from "./patients.service";
import {
  createPatientSchema,
  patientIdParamSchema,
  updatePatientSchema,
} from "./patients.schemas";

function findChromeExecutable(): string {
  const envPath = process.env.CHROME_EXECUTABLE_PATH;
  if (envPath) return envPath;

  const candidates = [
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }

  throw new HttpError(
    500,
    "Chrome no encontrado. Configurá CHROME_EXECUTABLE_PATH en .env",
  );
}

function getAuthenticatedUserId(user: Express.Request["user"]) {
  if (!user) {
    throw new HttpError(401, "Authentication required");
  }

  return user.id;
}

export const createPatientController = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const data = createPatientSchema.parse(req.body);
  const patient = await createPatient(userId, data);

  res.status(201).json({ patient });
});

export const listPatientsController = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const pagination = paginationSchema.parse(req.query);
  const result = await listPatients(userId, pagination);

  res.status(200).json(result);
});

export const getDashboardSummaryController = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const summary = await getDashboardSummary(userId);

  res.status(200).json({ summary });
});

export const getPatientByIdController = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const { id } = patientIdParamSchema.parse(req.params);
  const patient = await getPatientById(userId, id);

  res.status(200).json({ patient });
});

export const getPatientReportController = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const patientId = req.params.patientId;

  const reportHtml = await getPatientReport(userId, patientId);
  const executablePath = findChromeExecutable();

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(reportHtml, { waitUntil: "domcontentloaded" });
    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="informe-paciente.pdf"',
    );
    res.status(200).send(Buffer.from(pdfBuffer));
  } finally {
    await browser.close();
  }
});

export const updatePatientController = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const { id } = patientIdParamSchema.parse(req.params);
  const data = updatePatientSchema.parse(req.body);
  const patient = await updatePatient(userId, id, data);

  res.status(200).json({ patient });
});

export const deletePatientController = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const { id } = patientIdParamSchema.parse(req.params);

  await deletePatient(userId, id);

  res.status(204).send();
});
