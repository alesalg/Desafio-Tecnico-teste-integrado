package com.example.backend.controller;

import com.example.backend.dto.*;
import com.example.backend.service.BeneficioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/beneficios")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Benefícios", description = "API para gerenciamento de benefícios")
@CrossOrigin(origins = "*", maxAge = 3600)
public class BeneficioController {

    private final BeneficioService service;

    @Operation(summary = "Lista todos os benefícios", description = "Retorna lista completa de benefícios")
    @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
    @GetMapping
    public ResponseEntity<List<BeneficioResponse>> listarTodos() {
        log.info("GET /api/v1/beneficios - Listando todos");
        List<BeneficioResponse> beneficios = service.findAll();
        return ResponseEntity.ok(beneficios);
    }

    @Operation(summary = "Lista benefícios ativos", description = "Retorna apenas benefícios com status ativo")
    @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
    @GetMapping("/ativos")
    public ResponseEntity<List<BeneficioResponse>> listarAtivos() {
        log.info("GET /api/v1/beneficios/ativos");
        List<BeneficioResponse> beneficios = service.findAllAtivos();
        return ResponseEntity.ok(beneficios);
    }

    @Operation(summary = "Busca benefício por ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Benefício encontrado"),
        @ApiResponse(responseCode = "404", description = "Benefício não encontrado")
    })
    @GetMapping("/{id}")
    public ResponseEntity<BeneficioResponse> buscarPorId(
            @Parameter(description = "ID do benefício") @PathVariable Long id) {
        log.info("GET /api/v1/beneficios/{}", id);
        BeneficioResponse beneficio = service.findById(id);
        return ResponseEntity.ok(beneficio);
    }

    @Operation(summary = "Cria novo benefício")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Benefício criado com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos")
    })
    @PostMapping
    public ResponseEntity<BeneficioResponse> criar(
            @Valid @RequestBody BeneficioRequest request) {
        log.info("POST /api/v1/beneficios");
        BeneficioResponse created = service.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Operation(summary = "Atualiza benefício existente")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Benefício atualizado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Benefício não encontrado"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos")
    })
    @PutMapping("/{id}")
    public ResponseEntity<BeneficioResponse> atualizar(
            @Parameter(description = "ID do benefício") @PathVariable Long id,
            @Valid @RequestBody BeneficioRequest request) {
        log.info("PUT /api/v1/beneficios/{}", id);
        BeneficioResponse updated = service.update(id, request);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Deleta benefício (soft delete)", description = "Marca benefício como inativo")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Benefício deletado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Benefício não encontrado")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        log.info("DELETE /api/v1/beneficios/{}", id);
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Deleta benefício permanentemente", 
               description = "Remove benefício do banco de dados permanentemente")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Benefício deletado permanentemente"),
        @ApiResponse(responseCode = "404", description = "Benefício não encontrado")
    })
    @DeleteMapping("/{id}/permanente")
    public ResponseEntity<Void> deletarPermanente(@PathVariable Long id) {
        log.info("DELETE /api/v1/beneficios/{}/permanente", id);
        service.deletePermanently(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Transfere valor entre benefícios", 
               description = "Realiza transferência de valor entre dois benefícios com validações e locking")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Transferência realizada com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos ou saldo insuficiente"),
        @ApiResponse(responseCode = "404", description = "Benefício não encontrado")
    })
    @PostMapping("/transferir")
    public ResponseEntity<TransferenciaResponse> transferir(
            @Valid @RequestBody TransferenciaRequest request) {
        log.info("POST /api/v1/beneficios/transferir");
        TransferenciaResponse response = service.transferir(request);
        return ResponseEntity.ok(response);
    }
}
