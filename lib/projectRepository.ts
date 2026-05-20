import type { ProjectPlan } from "@prisma/client";
import type { ProjectPlanInput, ProjectPlanResponse } from "@/types/project";
import { prisma } from "./prisma";

function toProjectPlanResponse(plan: ProjectPlan): ProjectPlanResponse {
  return {
    id: plan.id,
    createdAt: plan.createdAt.toISOString(),
    updatedAt: plan.updatedAt.toISOString(),
    appName: plan.appName,
    appIdea: plan.appIdea,
    targetUser: plan.targetUser,
    appType: plan.appType as ProjectPlanResponse["appType"],
    developmentStack:
      plan.developmentStack as ProjectPlanResponse["developmentStack"],
    aiOption: plan.aiOption as ProjectPlanResponse["aiOption"],
    storageOption: plan.storageOption as ProjectPlanResponse["storageOption"],
    features: plan.features,
    screens: plan.screens,
    extraNotes: plan.extraNotes ?? "",
    generatedPrompt: plan.generatedPrompt
  };
}

export async function createProjectPlan(
  input: ProjectPlanInput,
  generatedPrompt: string
): Promise<ProjectPlanResponse> {
  const plan = await prisma.projectPlan.create({
    data: {
      appName: input.appName.trim(),
      appIdea: input.appIdea.trim(),
      targetUser: input.targetUser.trim(),
      appType: input.appType,
      developmentStack: input.developmentStack,
      aiOption: input.aiOption,
      storageOption: input.storageOption,
      features: input.features.trim(),
      screens: input.screens.trim(),
      extraNotes: input.extraNotes?.trim() || null,
      generatedPrompt
    }
  });

  return toProjectPlanResponse(plan);
}

export async function getRecentProjectPlans(): Promise<ProjectPlanResponse[]> {
  const plans = await prisma.projectPlan.findMany({
    orderBy: {
      createdAt: "desc"
    },
    take: 5
  });

  return plans.map(toProjectPlanResponse);
}

export async function deleteProjectPlan(id: string): Promise<void> {
  await prisma.projectPlan.delete({
    where: {
      id
    }
  });
}
