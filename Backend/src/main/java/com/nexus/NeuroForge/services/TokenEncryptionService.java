package com.nexus.NeuroForge.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.encrypt.Encryptors;
import org.springframework.security.crypto.encrypt.TextEncryptor;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;

@Service
public class TokenEncryptionService {

    @Value("${app.encryption.secret}")
    private String secret;

    // Must be a hex string. Generate once with: openssl rand -hex 16
    @Value("${app.encryption.salt}")
    private String salt;

    private TextEncryptor encryptor;

    @PostConstruct
    public void init() {
        this.encryptor = Encryptors.text(secret, salt);
    }

    public String encrypt(String plainText) {
        if (plainText == null || plainText.isBlank()) return null;
        return encryptor.encrypt(plainText);
    }

    public String decrypt(String cipherText) {
        if (cipherText == null || cipherText.isBlank()) return null;
        return encryptor.decrypt(cipherText);
    }
}