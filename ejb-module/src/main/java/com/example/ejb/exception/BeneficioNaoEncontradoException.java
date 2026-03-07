package com.example.ejb.exception;

import jakarta.ejb.ApplicationException;

@ApplicationException(rollback = true)
public class BeneficioNaoEncontradoException extends RuntimeException {
    
    private final Long beneficioId;
    
    public BeneficioNaoEncontradoException(Long beneficioId) {
        super(String.format("Benefício com ID %d não encontrado", beneficioId));
        this.beneficioId = beneficioId;
    }
    
    public Long getBeneficioId() {
        return beneficioId;
    }
}
