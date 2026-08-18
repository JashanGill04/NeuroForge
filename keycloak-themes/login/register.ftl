<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=true displayInfo=false; section>
    <#if section = "form">
        <h2 class="auth-title">Create your account</h2>
        <p class="auth-subtitle">Join NeuroForge Nexus to start collaborating</p>

        <form id="kc-register-form" action="${url.registrationAction}" method="post" novalidate>

            <#-- All non-password user profile attributes, in the order configured in the Admin Console -->
            <#list profile.attributes as attribute>
                <#if attribute.name != 'password' && attribute.name != 'password-confirm'>
                    <div class="form-group">
                        <label for="${attribute.name}">
                            ${advancedMsg(attribute.displayName!attribute.name)}
                            <#if attribute.required><span class="required-mark">*</span></#if>
                        </label>

                        <#if attribute.annotations.inputType?? && attribute.annotations.inputType == 'select'>
                            <select id="${attribute.name}"
                                    name="${attribute.name}"
                                    <#if attribute.required>required</#if>
                                    aria-invalid="<#if messagesPerField.existsError(attribute.name)>true<#else>false</#if>">
                                <option value="" disabled <#if !attribute.value?has_content>selected</#if>>
                                    Select ${advancedMsg(attribute.displayName!attribute.name)}
                                </option>
                                <#list (attribute.validators.options.options)![] as option>
                                    <option value="${option}" <#if attribute.value?? && attribute.value == option>selected</#if>>${option}</option>
                                </#list>
                            </select>
                        <#else>
                            <input type="<#if attribute.name == 'email'>email<#else>text</#if>"
                                   id="${attribute.name}"
                                   name="${attribute.name}"
                                   value="${(attribute.value!'')}"
                                   <#if attribute.readOnly>readonly</#if>
                                   <#if attribute.required>required</#if>
                                   aria-invalid="<#if messagesPerField.existsError(attribute.name)>true<#else>false</#if>"
                            />
                        </#if>

                        <#if messagesPerField.existsError(attribute.name)>
                            <span class="field-error" aria-live="polite">
                                ${kcSanitize(messagesPerField.get(attribute.name))?no_esc}
                            </span>
                        </#if>
                    </div>
                </#if>
            </#list>

            <#-- Password fields, shown unless registering through an identity provider -->
            <#if passwordRequired??>
                <div class="form-group">
                    <label for="password">Password <span class="required-mark">*</span></label>
                    <div class="input-wrapper">
                        <input type="password" id="password" name="password" autocomplete="new-password"
                               required
                               aria-invalid="<#if messagesPerField.existsError('password','password-confirm')>true<#else>false</#if>"/>
                        <button type="button" class="password-toggle-btn" aria-label="Show password" data-target="password" onclick="togglePassword(this)">
                            <svg class="icon-eye" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            <svg class="icon-eye-off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none;"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.86 21.86 0 0 1 5.06-6.06M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.86 21.86 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        </button>
                    </div>
                    <span class="field-hint">At least 8 characters, with an uppercase letter, a lowercase letter, a number, and a symbol.</span>
                    <#if messagesPerField.existsError('password')>
                        <span class="field-error" aria-live="polite">${kcSanitize(messagesPerField.get('password'))?no_esc}</span>
                    </#if>
                </div>

                <div class="form-group">
                    <label for="password-confirm">Confirm password <span class="required-mark">*</span></label>
                    <div class="input-wrapper">
                        <input type="password" id="password-confirm" name="password-confirm" autocomplete="new-password"
                               required
                               aria-invalid="<#if messagesPerField.existsError('password-confirm')>true<#else>false</#if>"/>
                        <button type="button" class="password-toggle-btn" aria-label="Show password" data-target="password-confirm" onclick="togglePassword(this)">
                            <svg class="icon-eye" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            <svg class="icon-eye-off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none;"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.86 21.86 0 0 1 5.06-6.06M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.86 21.86 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        </button>
                    </div>
                    <#if messagesPerField.existsError('password-confirm')>
                        <span class="field-error" aria-live="polite">${kcSanitize(messagesPerField.get('password-confirm'))?no_esc}</span>
                    </#if>
                </div>
            </#if>

            <#if recaptchaRequired?? && recaptchaVisible>
                <div class="form-group">
                    <div class="g-recaptcha" data-size="compact" data-sitekey="${recaptchaSiteKey}"></div>
                </div>
            </#if>

            <div class="auth-footer-text" style="margin-bottom: 16px;">
                &laquo; <a href="${url.loginUrl}">Back to Login</a>
            </div>

            <button class="btn-primary btn-block" type="submit" id="kc-register-submit">Register</button>
        </form>

        <script>
        (function () {
            var form = document.getElementById('kc-register-form');
            if (!form) return;

            var PASSWORD_MIN_LENGTH = 8;

           function ensureErrorEl(input) {
    var wrapper = input.closest('.input-wrapper') || input;
    var container = wrapper.parentElement;
    var errorEl = container.querySelector('.field-error-client');
    if (!errorEl) {
        errorEl = document.createElement('span');
        errorEl.className = 'field-error field-error-client';
        errorEl.setAttribute('aria-live', 'polite');
        wrapper.insertAdjacentElement('afterend', errorEl);
    }
    return errorEl;
}

            function setError(input, message) {
                input.setAttribute('aria-invalid', 'true');
                ensureErrorEl(input).textContent = message;
            }

            function clearError(input) {
    input.setAttribute('aria-invalid', 'false');
    var wrapper = input.closest('.input-wrapper') || input;
    var errorEl = wrapper.parentElement.querySelector('.field-error-client');
    if (errorEl) errorEl.textContent = '';
}

            function validateEmail(value) {
                var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return re.test(value) ? null : 'Enter a valid email address.';
            }

            function validatePassword(value) {
                if (value.length < PASSWORD_MIN_LENGTH) return 'Password must be at least ' + PASSWORD_MIN_LENGTH + ' characters.';
                if (!/[A-Z]/.test(value)) return 'Password must include an uppercase letter.';
                if (!/[a-z]/.test(value)) return 'Password must include a lowercase letter.';
                if (!/[0-9]/.test(value)) return 'Password must include a number.';
                if (!/[^A-Za-z0-9]/.test(value)) return 'Password must include a special character.';
                return null;
            }

            function validateField(input) {
                clearError(input);

                if (input.hasAttribute('required') && !input.value.trim() && input.type !== 'password') {
                    setError(input, 'This field is required.');
                    return false;
                }

                if (input.type === 'email' && input.value.trim()) {
                    var emailErr = validateEmail(input.value.trim());
                    if (emailErr) { setError(input, emailErr); return false; }
                }

                if (input.id === 'password') {
                    var pwErr = validatePassword(input.value);
                    if (pwErr) { setError(input, pwErr); return false; }
                }

                if (input.id === 'password-confirm') {
                    var password = document.getElementById('password');
                    if (password && input.value !== password.value) {
                        setError(input, 'Passwords do not match.');
                        return false;
                    }
                }

                return true;
            }

            // Validate on the way out of a field, so errors show up before submit is even tried
            form.querySelectorAll('input, select').forEach(function (el) {
                el.addEventListener('blur', function () { validateField(el); });
                el.addEventListener('input', function () { clearError(el); });
                el.addEventListener('change', function () { clearError(el); });
            });

            form.addEventListener('submit', function (e) {
                var isValid = true;
                var firstInvalid = null;

                form.querySelectorAll('input[required], select[required], #password, #password-confirm').forEach(function (el) {
                    var ok = validateField(el);
                    if (!ok) {
                        isValid = false;
                        if (!firstInvalid) firstInvalid = el;
                    }
                });

                if (!isValid) {
                    e.preventDefault();
                    if (firstInvalid) firstInvalid.focus();
                }
            });
        })();
        </script>
    </#if>
</@layout.registrationLayout>