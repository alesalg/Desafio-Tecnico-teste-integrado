package com.example.ejb.exception;

import jakarta.ejb.ApplicationException;

@ApplicationException(rollback = true)
public class SaldoInsuficienteException extends RuntimeException {
    
    private final Long beneficioId;
    private final java.math.BigDecimal saldoAtual;
    private final java.math.BigDecimal valorSolicitado;
    
    public SaldoInsuficienteException(Long beneficioId, java.math.BigDecimal saldoAtual, java.math.BigDecimal valorSolicitado) {
        super(String.format("Saldo insuficiente. Benefício ID: %d, Saldo: %.2f, Valor solicitado: %.2f", 
            beneficioId, saldoAtual, valorSolicitado));
        this.beneficioId = beneficioId;
        this.saldoAtual = saldoAtual;
        this.valorSolicitado = valorSolicitado;
    }
    
    public Long getBeneficioId() {
        return beneficioId;
    }
    
    public java.math.BigDecimal getSaldoAtual() {
        return saldoAtual;
    }
    
    public java.math.BigDecimal getValorSolicitado() {
        return valorSolicitado;
    }
}
