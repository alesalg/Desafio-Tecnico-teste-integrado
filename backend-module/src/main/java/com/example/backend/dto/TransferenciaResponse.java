package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransferenciaResponse {

    private Long fromId;
    private String fromNome;
    private BigDecimal fromNovoSaldo;
    
    private Long toId;
    private String toNome;
    private BigDecimal toNovoSaldo;
    
    private BigDecimal valorTransferido;
    private LocalDateTime dataHora;
    private String mensagem;
}
