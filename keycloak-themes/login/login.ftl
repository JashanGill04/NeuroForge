<#import "template.ftl" as layout>
<@layout.registrationLayout displayInfo=realm.password && realm.registrationAllowed && !registrationDisabled?? displayMessage=!messagesPerField.existsError('username','password'); section>
    <#if section = "form">
        <h2 class="auth-title">Welcome back</h2>
        <p class="auth-subtitle">Sign in to continue to NeuroForge Nexus</p>

        <form id="kc-form-login" onsubmit="login.disabled = true; return true;" action="${url.loginAction}" method="post">
            <div class="form-group">
                <label for="username">
                    <#if !realm.loginWithEmailAllowed>Username
                    <#elseif !realm.registrationEmailAsUsername>Username or email
                    <#else>Email</#if>
                </label>
                <input tabindex="1"
                       id="username"
                       name="username"
                       type="text"
                       value="${(login.username!'')}"
                       autofocus
                       autocomplete="username"
                       aria-invalid="<#if messagesPerField.existsError('username','password')>true<#else>false</#if>"
                />
                <#if messagesPerField.existsError('username','password')>
                    <span class="field-error" aria-live="polite">
                        ${kcSanitize(messagesPerField.getFirstError('username','password'))?no_esc}
                    </span>
                </#if>
            </div>

            <div class="form-group">
                <label for="password">Password</label>
                <div class="input-wrapper">
                    <input tabindex="2"
                           id="password"
                           name="password"
                           type="password"
                           autocomplete="current-password"
                           aria-invalid="<#if messagesPerField.existsError('username','password')>true<#else>false</#if>"
                    />
                    <button type="button" class="password-toggle-btn" aria-label="Show password" data-target="password" onclick="togglePassword(this)">
                        <svg class="icon-eye" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                        <svg class="icon-eye-off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none;">
                            <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.86 21.86 0 0 1 5.06-6.06M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.86 21.86 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                    </button>
                </div>
                <#if messagesPerField.existsError('username','password')>
                    <#-- error already shown above the username field to avoid double-printing -->
                </#if>
            </div>

            <div class="form-options">
                <#if realm.rememberMe && !usernameHidden??>
                    <label class="checkbox-label">
                        <input tabindex="3" id="rememberMe" name="rememberMe" type="checkbox" <#if login.rememberMe??>checked</#if>>
                        <span>Remember me</span>
                    </label>
                <#else>
                    <span></span>
                </#if>
                <#if realm.resetPasswordAllowed>
                    <a tabindex="5" href="${url.loginResetCredentialsUrl}">Forgot Password?</a>
                </#if>
            </div>

            <input type="hidden" id="id-hidden-input" name="credentialId" <#if auth.selectedCredential?has_content>value="${auth.selectedCredential}"</#if>/>
            <button tabindex="4" class="btn-primary btn-block" name="login" id="kc-login" type="submit">Sign In</button>
        </form>
    <#elseif section = "info">
        <#if realm.password && realm.registrationAllowed && !registrationDisabled??>
            <div class="auth-footer-text">
                New user? <a tabindex="6" href="${url.registrationUrl}">Register</a>
            </div>
        </#if>
    </#if>
</@layout.registrationLayout>
