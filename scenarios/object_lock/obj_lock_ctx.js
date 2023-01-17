let TLV = {
  TRC: 0,
  DBG: 1,
  INF: 2,
  WRN: 3,
  ERR: 4,
  CRI: 5,
  OFF: 6,
}

var object_versions = [];

function get_ObjectLockConfiguration_COMPLIANCE_YEARS() {
  return `<ObjectLockConfiguration>
  <ObjectLockEnabled>Enabled</ObjectLockEnabled>
    <Rule>
      <DefaultRetention>
        <Years>5</Years>
        <Mode>COMPLIANCE</Mode>
      </DefaultRetention>
    </Rule>
  </ObjectLockConfiguration>`;
}

function get_ObjectLockConfiguration_GOVERNANCE_DAYS() {
  return `<ObjectLockConfiguration>
  <ObjectLockEnabled>Enabled</ObjectLockEnabled>
    <Rule>
      <DefaultRetention>
        <Days>7</Days>
        <Mode>GOVERNANCE</Mode>
      </DefaultRetention>
    </Rule>
  </ObjectLockConfiguration>`;
}

function on_res_check_code_200(req_name) {
  assert(req_name + ": code", outObj.code == 200);
}

function on_res_1_get_object_lock() {
  assert("get-object-lock: code", outObj.code == 200);
  assert("get-object-lock: body.ObjectLockEnabled", outObj.body.ObjectLockEnabled == "Enabled");
}

function on_res_2_put_object_default_retention_compliance_5_years() {
  assert("put-object-default-retention-compliance-5-years: code", outObj.code == 200);
}

function on_res_2_get_object_default_retention_compliance_5_years() {
  assert("get-object-default-retention-compliance-5-years: code", outObj.code == 200);
  assert("get-object-default-retention-compliance-5-years: body.ObjectLockEnabled", outObj.body.ObjectLockEnabled == "Enabled");
  assert("get-object-default-retention-compliance-5-years: body.Rule.DefaultRetention.Mode", outObj.body.Rule.DefaultRetention.Mode == "COMPLIANCE");
  assert("get-object-default-retention-compliance-5-years: body.Rule.DefaultRetention.Years", outObj.body.Rule.DefaultRetention.Years == 5);
}

function on_res_2_put_object_default_retention_governance_days() {
  assert("put-object-default-retention-governance-1-day: code", outObj.code == 200);
}

function on_res_2_get_object_default_retention_governance_days() {
  assert("get-object-default-retention-governance-1-day: code", outObj.code == 200);
  assert("get-object-default-retention-governance-1-day: body.ObjectLockEnabled", outObj.body.ObjectLockEnabled == "Enabled");
  assert("get-object-default-retention-governance-1-day: body.Rule.DefaultRetention.Mode", outObj.body.Rule.DefaultRetention.Mode == "GOVERNANCE");
  assert("get-object-default-retention-governance-1-day: body.Rule.DefaultRetention.Days", outObj.body.Rule.DefaultRetention.Days == 7);
}

function on_res_3_get_bucket_versioning() {
  assert("get-bucket-versioning: code", outObj.code == 200);
  assert("get-bucket-versioning: body.Status", outObj.body.Status == "Enabled");
}

function on_res_3_put_bucket_versioning_suspend() {
  assert("suspend-bucket-versioning: code", outObj.code == 409);
  assert("suspend-bucket-versioning: body.Code", outObj.body.Code == "InvalidBucketState");
  assert("suspend-bucket-versioning: body.Message", outObj.body.Message == "bucket versioning cannot be disabled on buckets with object lock enabled");
}

function on_res_4_get_object_versions() {
  assert("get-object-versions: code", outObj.code == 200);
  assert("get-object-versions: body.Version.IsLatest", outObj.body.Version.IsLatest == true);
  assert("get-object-versions: body.Version.VersionId", outObj.body.Version.VersionId != "");
  object_versions["1"] = outObj.body.Version.VersionId;
}

function on_query_string_4_get_obj_retention() {
  return "retention&versionId=" + object_versions["1"] + "&format=json";
}
