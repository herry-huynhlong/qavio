"use client";
import { useEffect, useRef, useState } from "react";
import {
  slugifyTrial,
  trialInput,
  TRIAL_MAX_LOGO_BYTES,
  type TrialResult,
} from "@/lib/trial-contract";
const initial = {
  restaurantName: "",
  slug: "",
  ownerName: "",
  email: "",
  password: "",
  confirmPassword: "",
};
const messages: Record<string, string> = {
  SLUG_UNAVAILABLE: "Mã đường dẫn đã có người sử dụng. Hãy chọn mã khác.",
  EMAIL_ALREADY_REGISTERED:
    "Email đã có tài khoản QuánPilot. Hãy đăng nhập hoặc liên hệ QAVIO.",
  TRIAL_RATE_LIMITED: "Bạn đã thao tác nhiều lần. Vui lòng thử lại sau.",
  TRIAL_DISABLED: "Đăng ký dùng thử hiện chưa được mở.",
  TRIAL_NOT_CONFIGURED:
    "Hệ thống đăng ký đang thiếu cấu hình kết nối. Vui lòng thử lại sau.",
  FORMS_NOT_ENABLED: "Đăng ký dùng thử hiện chưa được mở.",
  TRIAL_UNAVAILABLE:
    "Dịch vụ tạo tài khoản đang tạm không phản hồi. Vui lòng thử lại sau.",
  TRIAL_RETRY_SAME_REQUEST:
    "Kết nối tới QuánPilot bị gián đoạn. Vui lòng gửi lại cùng thông tin.",
  TRIAL_QUOTA_NOT_CONFIGURED:
    "Hệ thống đăng ký chưa có giới hạn dùng thử hợp lệ.",
  TRIAL_UPSTREAM_UNAVAILABLE:
    "Không thể nhận phản hồi từ QuánPilot. Vui lòng thử lại sau.",
  SERVICE_AUTH_REQUIRED:
    "Kết nối xác thực với QuánPilot chưa hợp lệ. Vui lòng thử lại sau.",
  TRIAL_CAPACITY_REACHED:
    "Đợt dùng thử hiện đã đủ số lượng. Bạn có thể liên hệ QAVIO.",
  INVALID_LOGO:
    "Logo chưa hợp lệ. Dùng PNG, JPEG hoặc WebP tối đa 2 MB, 4000 × 4000 pixel.",
  IDEMPOTENCY_CONFLICT:
    "Thông tin của yêu cầu đang xử lý đã thay đổi. Vui lòng liên hệ QAVIO để kiểm tra trước khi gửi yêu cầu khác.",
};
export function TrialForm({loginUrl}:{loginUrl:string}) {
  const [values, setValues] = useState(initial),
    [enabled, setEnabled] = useState(false),
    [availabilityCode, setAvailabilityCode] = useState(""),
    [checked, setChecked] = useState(false),
    [busy, setBusy] = useState(false),
    [show, setShow] = useState(false),
    [notice, setNotice] = useState(""),
    [errors, setErrors] = useState<Record<string, string>>({}),
    [logo, setLogo] = useState<
      | {
          type: "image/png" | "image/jpeg" | "image/webp";
          base64: string;
        }
      | undefined
    >(),
    [logoName, setLogoName] = useState(""),
    [uploading, setUploading] = useState(false),
    [result, setResult] = useState<TrialResult | null>(null);
  const started = useRef(0),
    manualSlug = useRef(false),
    pending = useRef(false),
    logical = useRef({ payload: "", key: "" });
  useEffect(() => {
    started.current = Date.now();
    let live = true;
    fetch("/api/trial/session", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (!live) return;
        setEnabled(data.enabled === true);
        setAvailabilityCode(
          typeof data.code === "string" ? data.code : "",
        );
        setChecked(true);
      })
      .catch(() => {
        if (live) setChecked(true);
      });
    return () => {
      live = false;
    };
  }, []);
  function change(name: keyof typeof initial, value: string) {
    setValues((v) => ({
      ...v,
      [name]: value,
      ...(name === "restaurantName" && !manualSlug.current
        ? { slug: slugifyTrial(value) }
        : {}),
    }));
  }
  async function upload(file: File | undefined) {
    setLogo(undefined);
    setLogoName("");
    setErrors((e) => ({ ...e, logo: "" }));
    if (!file) return;
    if (
      !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
      file.size > TRIAL_MAX_LOGO_BYTES
    ) {
      setErrors((e) => ({ ...e, logo: messages.INVALID_LOGO }));
      return;
    }
    setUploading(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      let binary = "";
      for (const byte of bytes) binary += String.fromCharCode(byte);
      setLogo({
        type: file.type as "image/png" | "image/jpeg" | "image/webp",
        base64: btoa(binary),
      });
      setLogoName(file.name);
      setErrors((e) => ({ ...e, logo: "" }));
    } catch {
      setErrors((e) => ({
        ...e,
        logo: "Chưa đọc được logo. Vui lòng chọn lại file.",
      }));
    } finally {
      setUploading(false);
    }
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (pending.current || uploading || !enabled || result) return;
    const { confirmPassword, ...raw } = values;
    const input = trialInput.safeParse({ ...raw, ...(logo ? { logo } : {}) });
    const fields: Record<string, string> = {};
    if (!input.success)
      for (const e of input.error.issues) fields[String(e.path[0])] = e.message;
    if (values.password !== confirmPassword)
      fields.confirmPassword = "Xác nhận mật khẩu không khớp.";
    if (errors.logo) fields.logo = errors.logo;
    setErrors(fields);
    if (Object.keys(fields).length) {
      setNotice("Vui lòng kiểm tra thông tin được đánh dấu.");
      return;
    }
    pending.current = true;
    setBusy(true);
    setNotice("Đang tạo nhà hàng dùng thử…");
    const body = JSON.stringify({
      ...input.data,
      confirmPassword,
      website: "",
      startedAt: started.current,
    });
    if (logical.current.payload !== body)
      logical.current = { payload: body, key: crypto.randomUUID() };
    try {
      const r = await fetch("/api/trial/register", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "idempotency-key": logical.current.key,
          },
          body,
        }),
        data = await r.json();
      if (!r.ok) {
        const serverFields =
          data.fields && typeof data.fields === "object"
            ? Object.fromEntries(
                Object.entries(data.fields)
                  .map(([name, value]) => [
                    name,
                    Array.isArray(value) ? value[0] : value,
                  ])
                  .filter(
                    (entry): entry is [string, string] =>
                      typeof entry[1] === "string",
                  ),
              )
            : {};
        if (Object.keys(serverFields).length) setErrors(serverFields);
        setNotice(
          messages[data.code] ||
            "Chưa xác nhận được kết quả. Thông tin vẫn giữ trên trang; gửi lại để kiểm tra cùng yêu cầu, không tạo trùng.",
        );
        return;
      }
      if (!data.ok || !data.result) throw Error();
      setResult(data.result);
      setValues((v) => ({ ...v, password: "", confirmPassword: "" }));
      logical.current = { payload: "", key: "" };
      setLogo(undefined);
      setNotice("");
    } catch {
      setNotice(
        "Kết nối gián đoạn. Gửi lại cùng thông tin để kiểm tra yêu cầu trước đó.",
      );
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }
  const field = (
    name: keyof typeof initial,
    label: string,
    type = "text",
    required = true,
  ) => (
    <label htmlFor={"trial-" + name}>
      {label}
      {required && <span> (bắt buộc)</span>}
      <input
        id={"trial-" + name}
        name={name}
        type={type}
        value={values[name]}
        required={required}
        maxLength={name === "password" || name === "confirmPassword" ? 72 : 160}
        autoComplete={
          name === "password" || name === "confirmPassword"
            ? "new-password"
            : name === "email"
              ? "email"
              : name === "ownerName"
                ? "name"
                : "off"
        }
        aria-invalid={!!errors[name]}
        aria-describedby={errors[name] ? "trial-error-" + name : undefined}
        onChange={(e) => {
          if (name === "slug") manualSlug.current = true;
          change(name, e.target.value);
        }}
      />
      {errors[name] && (
        <small className="field-error" id={"trial-error-" + name}>
          {errors[name]}
        </small>
      )}
    </label>
  );
  if (result)
    return (
      <section
        className="form-card trial-success"
        aria-labelledby="trial-success-title"
      >
        <span className="eyebrow">SẴN SÀNG BẮT ĐẦU</span>
        <h2 id="trial-success-title">Đăng ký dùng thử thành công!</h2>
        <dl>
          {[
            ["Nhà hàng", result.restaurantName],
            ["Mã đường dẫn", result.slug],
            ["Chủ quán", result.ownerName],
            ["Email đăng nhập", result.email],
            ["Gói dùng thử", "TRAIN — Quyền BASIC — 1 tháng"],
            [
              "Ngày bắt đầu",
              new Date(result.startsAt).toLocaleString("vi-VN", {
                timeZone: "Asia/Ho_Chi_Minh",
              }),
            ],
            [
              "Ngày hết hạn",
              new Date(result.expiresAt).toLocaleString("vi-VN", {
                timeZone: "Asia/Ho_Chi_Minh",
              }),
            ],
          ].map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <p>
          Nhà hàng và tài khoản chủ quán đã được tạo. Sử dụng email trên cùng
          mật khẩu bạn vừa đăng ký để đăng nhập. Mật khẩu không được hiển thị lại.
        </p>
        <a className="button" href={result.loginUrl}>
          Đăng nhập và bắt đầu sử dụng ↗
        </a>
        <p>
          <a href={result.loginUrl}>{result.loginUrl}</a>
        </p>
        <div className="form-actions">
          <button
            type="button"
            className="text-link"
            onClick={() => {
              void navigator.clipboard
                .writeText(result.email)
                .then(() => setNotice("Đã sao chép email."))
                .catch(() =>
                  setNotice("Chưa thể sao chép. Bạn có thể chọn email ở trên."),
                );
            }}
          >
            Sao chép email
          </button>
          <button
            type="button"
            className="text-link"
            onClick={() => {
              void navigator.clipboard
                .writeText(result.loginUrl)
                .then(() => setNotice("Đã sao chép link đăng nhập."))
                .catch(() =>
                  setNotice(
                    "Chưa thể sao chép. Bạn có thể chọn liên kết ở trên.",
                  ),
                );
            }}
          >
            Sao chép link
          </button>
        </div>
        <p role="status">{notice}</p>
      </section>
    );
  return (
    <section className="form-card trial-card">
      {!checked ? (
        <p role="status">Đang kiểm tra đăng ký…</p>
      ) : !enabled ? (
        <div className="notice">
          <strong>
            {availabilityCode === "TRIAL_NOT_CONFIGURED"
              ? "Cần hoàn tất cấu hình đăng ký"
              : "Đăng ký tự động chưa được mở"}
          </strong>
          <p>{messages[availabilityCode] || messages.TRIAL_DISABLED}</p>
        </div>
      ) : null}
      <p>
        Đã có tài khoản QuánPilot? <a href={loginUrl}>Đăng nhập ↗</a>
      </p>
      <form
        onSubmit={(event) => {
          void submit(event);
        }}
        noValidate
      >
        <fieldset disabled={!enabled || busy || uploading}>
          <legend>Thông tin nhà hàng</legend>
          <div className="form-grid">
            {field("restaurantName", "Tên nhà hàng hoặc quán")}
            {field("slug", "Mã đường dẫn")}
            <label className="full-field" htmlFor="trial-logo">
              Logo nhà hàng <span>(tùy chọn)</span>
              <input
                id="trial-logo"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => {
                  void upload(e.target.files?.[0]);
                }}
              />
              <small>
                PNG, JPEG hoặc WebP · Tối đa 2 MB và 4000 × 4000 pixel.
                {logoName && " Đã chọn: " + logoName}
              </small>
              {errors.logo && (
                <small className="field-error">{errors.logo}</small>
              )}
            </label>
          </div>
        </fieldset>
        <fieldset disabled={!enabled || busy || uploading}>
          <legend>Thông tin chủ quán</legend>
          <div className="form-grid">
            {field("ownerName", "Họ tên chủ quán")}
            {field("email", "Email đăng nhập", "email")}
            {field("password", "Mật khẩu", show ? "text" : "password")}
            {field(
              "confirmPassword",
              "Xác nhận mật khẩu",
              show ? "text" : "password",
            )}
          </div>
          <button
            type="button"
            className="text-link"
            aria-pressed={show}
            onClick={() => setShow((v) => !v)}
          >
            {show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          </button>
          <p>
            Mật khẩu từ 8 ký tự, tối đa 72 byte. Chỉ dùng để tạo tài khoản tại
            QuánPilot.
          </p>
        </fieldset>
        <button
          type="submit"
          className="button"
          disabled={!enabled || busy || uploading}
        >
          {busy ? "Đang xử lý…" : "Tạo tài khoản dùng thử"}
        </button>
        <p role="status" aria-live="polite" className="form-status">
          {notice}
        </p>
      </form>
    </section>
  );
}
