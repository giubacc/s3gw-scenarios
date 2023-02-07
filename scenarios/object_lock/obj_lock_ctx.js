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

function data_ObjectLockConfiguration(mode, amount, type) {
  return `<ObjectLockConfiguration>
  <ObjectLockEnabled>Enabled</ObjectLockEnabled>
    <Rule>
      <DefaultRetention>` +
    ((type == "Years") ? `<Years>` + amount + `</Years>` : `<Days>` + amount + `</Days>`)
    + `<Mode>` + mode + `</Mode>
      </DefaultRetention>
    </Rule>
  </ObjectLockConfiguration>`;
}

function data_bucket_versioning(status) {
  return `<VersioningConfiguration xmlns='http://s3.amazonaws.com/doc/2006-03-01/'>
            <MfaDelete>Disabled</MfaDelete>
            <Status>` + status + `</Status>
          </VersioningConfiguration>`;
}

function query_string_get_obj_versions(objName) {
  return "versions&encoding-type=url&objs-container=true&prefix=" + objName + "&format=json";
}

function query_string_get_obj_retention(objName) {
  return "retention&versionId=" + object_versions[objName] + "&format=json";
}

function on_res_check_code_200(outCtxJson, req_name) {
  assert(req_name + ": code", outCtxJson.code == 200);
}

function on_res_GET_object_lock(outCtxJson) {
  assert("get-object-lock: code", outCtxJson.code == 200);
  assert("get-object-lock: body.ObjectLockEnabled", outCtxJson.body.ObjectLockEnabled == "Enabled");
}

function on_res_GET_bucket_default_retention(outCtxJson, ObjectLockEnabled, Mode, amount, type) {
  assert("get-bucket-default-retention: code", outCtxJson.code == 200);
  assert("get-bucket-default-retention: body.ObjectLockEnabled", outCtxJson.body.ObjectLockEnabled == ObjectLockEnabled);
  assert("get-bucket-default-retention: body.Rule.DefaultRetention.Mode", outCtxJson.body.Rule.DefaultRetention.Mode == Mode);
  if (type == "Years") {
    assert("get-bucket-default-retention: body.Rule.DefaultRetention.Years", outCtxJson.body.Rule.DefaultRetention.Years == amount);
  } else {
    assert("get-bucket-default-retention: body.Rule.DefaultRetention.Days", outCtxJson.body.Rule.DefaultRetention.Days == amount);
  }
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

function addDays(date, days) {
  date.setDate(date.getDate() + days);
  return date;
}

function on_res_GET_object_retention(outCtxJson, Mode, amount, type) {
  const today = new Date();
  const againstDate = addDays(today, (type == "Years" ? 365 * amount : amount));

  assert("get-object-retention: code", outCtxJson.code == 200);
  assert("get-object-retention: body.Mode", outCtxJson.body.Mode == Mode);

  const checkDate = new Date(outCtxJson.body.RetainUntilDate);

  log(TLV.DBG, "againstDate:", againstDate);
  log(TLV.DBG, "checkDate:", checkDate);

  assert("get-object-retention: YYYY", againstDate.getFullYear() == checkDate.getFullYear());
  assert("get-object-retention: MM", againstDate.getMonth() == checkDate.getMonth());
  assert("get-object-retention: DD", againstDate.getDate() == checkDate.getDate());
}
