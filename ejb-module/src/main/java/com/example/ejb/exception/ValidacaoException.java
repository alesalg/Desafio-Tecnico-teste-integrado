package com.example.ejb.exception;

import jakarta.ejb.ApplicationException;

@ApplicationException(rollback = true)
public class ValidacaoException extends RuntimeException {
    
    public ValidacaoException(String mensagem) {
        super(mensagem);
    }
}
