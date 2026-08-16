package com.nexus.NeuroForge.services;

import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@Component
public class WebhookSignatureValidator {

    private static final String HMAC_ALGO = "HmacSHA256";

    /**
     * Verifies a GitHub-style "sha256=<hex>" signature header against the raw
     * request body, using the per-project webhook secret. Uses a
     * constant-time comparison to avoid timing attacks on the signature check.
     */
    public boolean isValid(String rawBody, String signatureHeader, String secret) {
        if (signatureHeader == null || signatureHeader.isBlank() || secret == null || secret.isBlank()) {
            return false;
        }

        String expected = computeSignature(rawBody, secret);
        String provided = signatureHeader.startsWith("sha256=")
                ? signatureHeader.substring("sha256=".length())
                : signatureHeader;

        return MessageDigest.isEqual(
                expected.getBytes(StandardCharsets.UTF_8),
                provided.getBytes(StandardCharsets.UTF_8)
        );
    }

    public String computeSignature(String rawBody, String secret) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGO);
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), HMAC_ALGO));
            byte[] hash = mac.doFinal(rawBody.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to compute webhook signature", e);
        }
    }
}