<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=true displayInfo=false; section>
    <#if section = "form">
        <h2 class="auth-title">Create your account</h2>
        <p class="auth-subtitle">Join NeuroForge Nexus to start collaborating</p>

        <form id="kc-register-form" action="${url.registrationAction}" method="post">

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
                               aria-invalid="<#if messagesPerField.existsError('password','password-confirm')>true<#else>false</#if>"/>
                        <button type="button" class="password-toggle-btn" aria-label="Show password" data-target="password" onclick="togglePassword(this)">
                            <svg class="icon-eye" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            <svg class="icon-eye-off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none;"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.86 21.86 0 0 1 5.06-6.06M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.86 21.86 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        </button>
                    </div>
                    <#if messagesPerField.existsError('password')>
                        <span class="field-error" aria-live="polite">${kcSanitize(messagesPerField.get('password'))?no_esc}</span>
                    </#if>
                </div>

                <div class="form-group">
                    <label for="password-confirm">Confirm password <span class="required-mark">*</span></label>
                    <div class="input-wrapper">
                        <input type="password" id="password-confirm" name="password-confirm" autocomplete="new-password"
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

            <button class="btn-primary btn-block" type="submit">Register</button>
        </form>
    </#if>
</@layout.registrationLayout>
