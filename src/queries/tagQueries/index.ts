import { create } from "./createQuery";
import { deleteTag } from "./deleteQuery";
import { getAllTags } from "./getManyQuery";
import { getTag } from "./getQuery";
import { updateTagCount } from "./updateCountQuery";
import { updateTagCountMany } from "./updateManyCount";
import { updateTag } from "./updateQuery";
import { updateTagStatus } from "./updateStatusQuery";

export const tagQueries = {
  create,
  deleteTag,
  getAllTags,
  getTag,
  updateTag,
  updateTagStatus,
  updateTagCount,
  updateTagCountMany,
};
