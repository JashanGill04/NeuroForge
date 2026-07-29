<#macro registrationLayout bodyClass="" displayInfo=false displayMessage=true displayRequiredFields=false>
<!DOCTYPE html>
<html class="${properties.kcHtmlClass!''}">
<head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="robots" content="noindex, nofollow">
    <title>${msg("loginTitle",(realm.displayName!'NeuroForge Nexus'))}</title>
    <link rel="icon" href="${url.resourcesPath}/img/favicon.ico" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="${url.resourcesPath}/css/custom.css">
</head>
<body class="landing" style="margin: 0; padding: 0; height: 100vh; overflow: hidden;">
    <div style="display: flex; height: 100vh; width: 100vw; background: var(--bg); font-family: 'Inter', sans-serif; color: var(--ink);">
        
        <!-- Left Brand / Visual Side (Split Screen) -->
        <div style="flex: 1; background: radial-gradient(900px 500px at 20% 0%, rgba(124, 107, 255, 0.16), transparent 60%), var(--surface); border-right: 1px solid var(--line); display: flex; flex-direction: column; justify-content: space-between; padding: 60px; position: relative;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <div class="brand-mark">NF</div>
                <div>
                    <div style="font-weight: 700; font-size: 15px; color: var(--ink);">NEUROFORGE-NEXUS</div>
                    <div style="font-size: 11px; color: var(--ink-faint);">Enterprise SDLC Platform</div>
                </div>
            </div>
            
            <div style="max-width: 440px;">
                <span class="section-eyebrow">AI-Powered Engineering</span>
                <h1 style="font-size: clamp(32px, 3.5vw, 44px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; margin: 16px 0 16px;">
                    Build, track, and ship smarter <span class="hero-gradient-text">together.</span>
                </h1>
                <p style="color: var(--ink-soft); font-size: 15px; line-height: 1.6; margin: 0;">
                    Streamline your agile workflows, automate sprint tracking, and eliminate delivery blockers with intelligent workspace management.
                </p>
            </div>

            <div style="color: var(--ink-faint); font-size: 12px;">
                &copy; 2026 NeuroForge Inc. All rights reserved.
            </div>
        </div>

        <!-- Right Form Side -->
        <div style="width: 520px; display: flex; align-items: center; justify-content: center; padding: 40px; background: var(--bg); overflow-y: auto;">
            <div class="auth-card" style="width: 100%; max-width: 400px;">
                
                <!-- Feedback Messages (Errors / Success) -->
                <#if displayMessage && message?has_content && (message.type != 'warning' || !isAppInitiatedActionResponse?has_content)>
                    <div class="alert <#if message.type = 'error'>alert-error<#elseif message.type = 'success'>alert-success</#if>" style="margin-bottom: 20px;">
                        <span>${message.summary}</span>
                    </div>
                </#if>

                <!-- Form Slot (Injected automatically by Keycloak login.ftl / register.ftl) -->
                <#nested "form">

                <!-- Info Slot (Register link, forgot password triggers) -->
                <#if displayInfo>
                    <div style="margin-top: 20px; text-align: center;">
                        <#nested "info">
                    </div>
                </#if>
            </div>
        </div>

    </div>

    <script>
        function togglePassword(btn) {
            var targetId = btn.getAttribute('data-target');
            var input = document.getElementById(targetId);
            if (!input) return;
            var eye = btn.querySelector('.icon-eye');
            var eyeOff = btn.querySelector('.icon-eye-off');
            if (input.type === 'password') {
                input.type = 'text';
                eye.style.display = 'none';
                eyeOff.style.display = 'block';
                btn.setAttribute('aria-label', 'Hide password');
            } else {
                input.type = 'password';
                eye.style.display = 'block';
                eyeOff.style.display = 'none';
                btn.setAttribute('aria-label', 'Show password');
            }
        }
    </script>
</body>
</html>
</#macro>