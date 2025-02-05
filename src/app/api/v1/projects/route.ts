import { NextResponse } from "next/server";
import { validateAspApiKey } from "../../../utils/postbackUtils";
import { fetchProjects } from "../../../utils/projectUtils";
import { ProjectData } from "../../../types";

/**
 * GET /api/v1/projects
 * 
 * Retrieves all project data from Qube, excluding unnecessary fields.
 * 
 * Headers:
 * - x-api-key: {API_KEY} (Required) - API key for authentication.
 * 
 * Response:
 * - 200 OK: Returns an array of project data.
 * - 401 Unauthorized: Invalid or missing API key.
 * - 500 Internal Server Error: Unexpected failure.
 * 
 * @param {Request} req - Incoming HTTP request object.
 * @returns {Response} - JSON response with project data.
 */
export async function GET(req: Request) {
  try {
    // Validate API key
    const apiKey = req.headers.get("x-api-key");
    if (!apiKey || !(await validateAspApiKey(apiKey))) {
      return NextResponse.json({ error: "Unauthorized: Invalid API key" }, { status: 401 });
    }

    // Retrieve all project data
    const projects: ProjectData[] = await fetchProjects();

    // Remove unnecessary fields
    const cleanedProjects = projects.map(({ 
      updatedAt, targeting, createdAt, isVisibleOnMarketplace, 
      lastPaymentDate, externalCampaigns, totalPaidOut, 
      isReferralEnabled, ownerAddresses, ...filteredProject 
    }) => filteredProject);

    // Return successful response with project data
    return NextResponse.json({ projects: cleanedProjects }, { status: 200 });

  } catch (error) {
    console.error("Error fetching project data:", error);
    
    // Return error response for unexpected failures
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}