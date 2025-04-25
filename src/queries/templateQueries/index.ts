import { createTemplate } from "./createTemplate";
import { deleteTemplate } from "./deleteTemplate";
import { getAllTemplates } from "./getAllTemplates";
import { getTemplate } from "./getTemplate";
import { updateTemplate } from "./updateTemplate";
import { updateTemplateType } from "./updateTemplateType";

export const templateQueries = {
  createTemplate,
  getAllTemplates,
  updateTemplate,
  getTemplate,
  deleteTemplate,
  updateTemplateType
};
