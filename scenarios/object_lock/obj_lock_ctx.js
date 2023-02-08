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
  return `<ObjectLockConfiguration xmlns='http://s3.amazonaws.com/doc/2006-03-01/'>
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
function data_object_retention(mode, ts) {
  return `<Retention xmlns='http://s3.amazonaws.com/doc/2006-03-01/'>
            <Mode>` + mode + `</Mode>
            <RetainUntilDate>` + ts + `</RetainUntilDate>
          </Retention>`;
}

function query_string_get_obj_versions(objName) {
  return "format=json&versions&encoding-type=url&objs-container=true&prefix=" + objName;
}

function query_string_get_versioned_obj_request(objName, request, explicitVersion) {
  return "format=json&versionId=" + ((explicitVersion !== undefined && explicitVersion) != "" ? explicitVersion : object_versions[objName]) +
    ((request !== undefined && request != "") ? "&" + request : "");
}

function on_RES_code_200(outCtxJson, ctxTest) {
  assert("200-@" + ctxTest, outCtxJson.code == 200);
}

function on_GET_bucket_object_lock(outCtxJson, ctxTest, expCode, expBodyObjectLockEnabled) {
  assert("get-bucket-object-lock@" + ctxTest + ": code", outCtxJson.code == expCode);
  assert("get-bucket-object-lock@" + ctxTest + ": body.ObjectLockEnabled", outCtxJson.body.ObjectLockEnabled == expBodyObjectLockEnabled);
}

function on_GET_bucket_default_retention(outCtxJson, ctxTest, expCode, expBodyObjectLockEnabled, expMode, expAmount, expType) {
  assert("get-bucket-default-retention@" + ctxTest + ": code", outCtxJson.code == expCode);
  assert("get-bucket-default-retention@" + ctxTest + ": body.ObjectLockEnabled", outCtxJson.body.ObjectLockEnabled == expBodyObjectLockEnabled);
  assert("get-bucket-default-retention@" + ctxTest + ": body.Rule.DefaultRetention.Mode", outCtxJson.body.Rule.DefaultRetention.Mode == expMode);
  if (expType == "Years") {
    assert("get-bucket-default-retention@" + ctxTest + ": body.Rule.DefaultRetention.Years", outCtxJson.body.Rule.DefaultRetention.Years == expAmount);
  } else {
    assert("get-bucket-default-retention@" + ctxTest + ": body.Rule.DefaultRetention.Days", outCtxJson.body.Rule.DefaultRetention.Days == expAmount);
  }
}

function on_GET_bucket_versioning(outCtxJson, ctxTest, expCode, expBodyStatus) {
  assert("get-bucket-versioning@" + ctxTest + ": code", outCtxJson.code == expCode);
  assert("get-bucket-versioning@" + ctxTest + ": body.Status", outCtxJson.body.Status == expBodyStatus);
}

function on_PUT_bucket_versioning(outCtxJson, ctxTest, expCode, expBodyCode, expBodyMessage) {
  assert("put-bucket-versioning@" + ctxTest + ": code", outCtxJson.code == expCode);
  assert("put-bucket-versioning@" + ctxTest + ": body.Code", outCtxJson.body.Code == expBodyCode);
  assert("put-bucket-versioning@" + ctxTest + ": body.Message", outCtxJson.body.Message == expBodyMessage);
}

function on_GET_object_versions(outCtxJson, ctxTest, expCode, expBodyIsLatest, objNameVer) {
  assert("get-object-versions@" + ctxTest + ": code", outCtxJson.code == expCode);
  assert("get-object-versions@" + ctxTest + ": body.Version.IsLatest", outCtxJson.body.Version.IsLatest == expBodyIsLatest);
  assert("get-object-versions@" + ctxTest + ": body.Version.VersionId [not empty]", outCtxJson.body.Version.VersionId != "");
  object_versions[objNameVer] = outCtxJson.body.Version.VersionId;
}

function addDays(date, days) {
  date.setDate(date.getDate() + days);
  return date;
}

function on_GET_object_retention(outCtxJson, ctxTest, expCode, expBodyMode, amount, type) {
  const today = new Date();
  const againstDate = addDays(today, (type == "Years" ? 365 * amount : amount));

  assert("get-object-retention@" + ctxTest + ": code", outCtxJson.code == expCode);
  assert("get-object-retention@" + ctxTest + ": body.Mode", outCtxJson.body.Mode == expBodyMode);

  const checkDate = new Date(outCtxJson.body.RetainUntilDate);

  log(TLV.DBG, "againstDate:", againstDate);
  log(TLV.DBG, "checkDate:", checkDate);

  assert("get-object-retention@" + ctxTest + ": YEAR", againstDate.getFullYear() == checkDate.getFullYear());
  assert("get-object-retention@" + ctxTest + ": MONTH", againstDate.getMonth() == checkDate.getMonth());
  assert("get-object-retention@" + ctxTest + ": DAY", againstDate.getDate() == checkDate.getDate());
}

function on_GET_object_retention_TS(outCtxJson, ctxTest, expCode, expBodyMode, expBodyRetainUntilDate) {
  assert("get-object-retention-ts@" + ctxTest + ": code", outCtxJson.code == expCode);
  assert("get-object-retention-ts@" + ctxTest + ": body.Mode", outCtxJson.body.Mode == expBodyMode);
  assert("get-object-retention-ts@" + ctxTest + ": body.RetainUntilDate", outCtxJson.body.RetainUntilDate == expBodyRetainUntilDate);
}

function on_DELETE_object(outCtxJson, ctxTest, expCode, expBodyCode, expBodyMessage) {
  assert("delete-object@" + ctxTest + ": code", outCtxJson.code == expCode);
  if (expBodyCode !== undefined)
    assert("delete-object@" + ctxTest + ": body.Code", outCtxJson.body.Code == expBodyCode);
  if (expBodyMessage !== undefined)
    assert("delete-object@" + ctxTest + ": body.Message", outCtxJson.body.Message == expBodyMessage);
}

function on_PUT_object_retention(outCtxJson, ctxTest, expCode, expBodyCode, expBodyMessage) {
  assert("put-object-retention@" + ctxTest + ": code", outCtxJson.code == expCode);
  if (expBodyCode !== undefined)
    assert("put-object-retention@" + ctxTest + ": body.Code", outCtxJson.body.Code == expBodyCode);
  if (expBodyMessage !== undefined)
    assert("put-object-retention@" + ctxTest + ": body.Message", outCtxJson.body.Message == expBodyMessage);
}
