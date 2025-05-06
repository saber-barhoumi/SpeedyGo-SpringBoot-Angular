package com.ski.speedygobackend.Enum;

public enum TrafficLevel {
    LOW, MEDIUM, HIGH ;
    public boolean equalsIgnoreCase(String value) {
        return this.name().equalsIgnoreCase(value);
    }
}
