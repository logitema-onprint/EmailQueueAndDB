import { createTemplate } from "./createTemplate";
import { deleteTemplate } from "./deleteTemplate";
import { getAllTemplates } from "./getALLTemplates";
import { getTemplate } from "./getTemplate";
import { updateTemplate } from "./updateTemplate";
import { updateTemplateName } from "./updateTemplateName";

export const templateControllers = {
  createTemplate,
  getAllTemplates,
  updateTemplate,
  updateTemplateName,
  getTemplate,
  deleteTemplate,
};
