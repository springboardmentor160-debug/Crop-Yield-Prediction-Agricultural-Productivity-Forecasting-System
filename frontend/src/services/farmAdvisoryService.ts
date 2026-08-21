/**
 * YieldSense AI  -  Farm Advisory Service (Week 6)
 */

import api from "./api";
import type { FarmAdvisoryResponse } from "@/types/farmAdvisory";

export const farmAdvisoryService = {
  /**
   * Fetch farm-specific recommendations and risk assessment.
   */
  async getFarmAdvisory(farmId: string): Promise<FarmAdvisoryResponse> {
    const response = await api.get<FarmAdvisoryResponse>(`/recommendations/farm/${farmId}`);
    return response.data;
  },
};
