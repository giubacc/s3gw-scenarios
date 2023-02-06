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

function data_ObjectLockConfiguration_COMPLIANCE_YEARS() {
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

function data_ObjectLockConfiguration_GOVERNANCE_DAYS() {
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

function data_ENABLE_bucket_versioning() {
  return `<VersioningConfiguration xmlns='http://s3.amazonaws.com/doc/2006-03-01/'>
            <MfaDelete>Disabled</MfaDelete>
            <Status>Enabled</Status>
          </VersioningConfiguration>`;
}

function data_SUSPEND_bucket_versioning() {
  return `<VersioningConfiguration xmlns='http://s3.amazonaws.com/doc/2006-03-01/'>
            <MfaDelete>Disabled</MfaDelete>
            <Status>Suspended</Status>
          </VersioningConfiguration>`;
}

function on_res_check_code_200(outCtxJson, req_name) {
  assert(req_name + ": code", outCtxJson.code == 200);
}

function on_res_GET_object_lock(outCtxJson) {
  assert("get-object-lock: code", outCtxJson.code == 200);
  assert("get-object-lock: body.ObjectLockEnabled", outCtxJson.body.ObjectLockEnabled == "Enabled");
}

function on_res_PUT_object_default_retention_compliance_5_years(outCtxJson) {
  assert("put-object-default-retention-compliance-5-years: code", outCtxJson.code == 200);
}

function on_res_GET_object_default_retention_compliance_5_years(outCtxJson) {
  assert("get-object-default-retention-compliance-5-years: code", outCtxJson.code == 200);
  assert("get-object-default-retention-compliance-5-years: body.ObjectLockEnabled", outCtxJson.body.ObjectLockEnabled == "Enabled");
  assert("get-object-default-retention-compliance-5-years: body.Rule.DefaultRetention.Mode", outCtxJson.body.Rule.DefaultRetention.Mode == "COMPLIANCE");
  assert("get-object-default-retention-compliance-5-years: body.Rule.DefaultRetention.Years", outCtxJson.body.Rule.DefaultRetention.Years == 5);
}

function on_res_PUT_object_default_retention_governance_days(outCtxJson) {
  assert("put-object-default-retention-governance-1-day: code", outCtxJson.code == 200);
}

function on_res_GET_object_default_retention_governance_days(outCtxJson) {
  assert("get-object-default-retention-governance-1-day: code", outCtxJson.code == 200);
  assert("get-object-default-retention-governance-1-day: body.ObjectLockEnabled", outCtxJson.body.ObjectLockEnabled == "Enabled");
  assert("get-object-default-retention-governance-1-day: body.Rule.DefaultRetention.Mode", outCtxJson.body.Rule.DefaultRetention.Mode == "GOVERNANCE");
  assert("get-object-default-retention-governance-1-day: body.Rule.DefaultRetention.Days", outCtxJson.body.Rule.DefaultRetention.Days == 7);
}

function on_res_GET_bucket_versioning(outCtxJson) {
  assert("get-bucket-versioning: code", outCtxJson.code == 200);
  assert("get-bucket-versioning: body.Status", outCtxJson.body.Status == "Enabled");
}

function on_res_PUT_bucket_versioning_suspend(outCtxJson) {
  assert("suspend-bucket-versioning: code", outCtxJson.code == 409);
  assert("suspend-bucket-versioning: body.Code", outCtxJson.body.Code == "InvalidBucketState");
  assert("suspend-bucket-versioning: body.Message", outCtxJson.body.Message == "bucket versioning cannot be disabled on buckets with object lock enabled");
}

function on_res_GET_object_versions(outCtxJson, objName) {
  assert("get-object-versions: code", outCtxJson.code == 200);
  assert("get-object-versions: body.Version.IsLatest", outCtxJson.body.Version.IsLatest == true);
  assert("get-object-versions: body.Version.VersionId", outCtxJson.body.Version.VersionId != "");
  object_versions[objName] = outCtxJson.body.Version.VersionId;
}

function query_string_get_obj_retention(outCtxJson, objName) {
  return "retention&versionId=" + object_versions[objName] + "&format=json";
}
