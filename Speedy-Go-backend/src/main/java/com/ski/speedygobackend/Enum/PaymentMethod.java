package com.ski.speedygobackend.Enum;

public enum PaymentMethod {
    CREDIT_CARD("CREDIT_CARD"); // Map to database-friendly value
    private final String databaseValue;

    PaymentMethod(String databaseValue) {
        this.databaseValue = databaseValue;
    }

    public String getDatabaseValue() {
        return databaseValue;
    }

    @Override
    public String toString() {
        return databaseValue;
    }
}

