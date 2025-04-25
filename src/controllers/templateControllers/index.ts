import { createTemplate } from "./createTemplate";
import { deleteTemplate } from "./deleteTemplate";
import { getAllTemplates } from "./getALLTemplates";
import { getTemplate } from "./getTemplate";
import { updateTemplate } from "./updateTemplate";
import { updateTemplateName } from "./updateTemplateName";
import { updateTemplateType } from "./updateTemplateType";

export const templateControllers = {
  createTemplate,
  getAllTemplates,
  updateTemplate,
  updateTemplateName,
  updateTemplateType,
  getTemplate,
  deleteTemplate,
};
