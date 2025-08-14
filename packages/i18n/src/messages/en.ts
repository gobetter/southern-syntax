import { type CommonMessages } from "@southern-syntax/types";

import admin_dashboard from "./admin_dashboard/en.json";
import admin_media from "./admin_media/en.json";
import admin_media_taxonomy from "./admin_media_taxonomy/en.json";
import admin_users from "./admin_users/en.json";
import admin_audit_log from "./admin_audit_log/en.json";
import admin_navigation from "./admin_navigation/en.json";
import admin_rbac from "./admin_rbac/en.json";
import auth from "./auth/en.json";
import common from "./common/en.json";
import roles from "./roles/en.json";

export default {
  admin_audit_log,
  admin_dashboard,
  admin_media,
  admin_media_taxonomy,
  admin_users,
  admin_navigation,
  admin_rbac,
  auth,
  // common,
  common: common as CommonMessages,
  roles,
};
