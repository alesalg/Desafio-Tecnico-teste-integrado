package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BeneficioResponse {

    private Long id;
    private String nome;
    private String descricao;
    private BigDecimal valor;
    private Boolean ativo;
    private Long version;
}
