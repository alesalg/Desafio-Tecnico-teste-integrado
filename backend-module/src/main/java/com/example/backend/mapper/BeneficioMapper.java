package com.example.backend.mapper;

import com.example.backend.dto.BeneficioRequest;
import com.example.backend.dto.BeneficioResponse;
import com.example.backend.model.Beneficio;
import org.springframework.stereotype.Component;

@Component
public class BeneficioMapper {

    public Beneficio toEntity(BeneficioRequest request) {
        return Beneficio.builder()
                .nome(request.getNome())
                .descricao(request.getDescricao())
                .valor(request.getValor())
                .ativo(request.getAtivo() != null ? request.getAtivo() : true)
                .build();
    }

    public BeneficioResponse toResponse(Beneficio entity) {
        return BeneficioResponse.builder()
                .id(entity.getId())
                .nome(entity.getNome())
                .descricao(entity.getDescricao())
                .valor(entity.getValor())
                .ativo(entity.getAtivo())
                .version(entity.getVersion())
                .build();
    }

    public void updateEntity(BeneficioRequest request, Beneficio entity) {
        entity.setNome(request.getNome());
        entity.setDescricao(request.getDescricao());
        entity.setValor(request.getValor());
        if (request.getAtivo() != null) {
            entity.setAtivo(request.getAtivo());
        }
    }
}
