import { describe, expect, test } from "vitest";
import { ECSManager } from "../src/client/ecs/core";
import { SistemaActivo } from "../src/client/ecs/systems";
import { TipoActivo } from "../src/client/shared/types/DeviceEnums";
import { Activo } from "../src/client/shared/types/EscenarioTypes";

describe("SistemaActivo", () => {
    test("verifica la firma de un documento junto con la clave pública", async () => {
        const em = new ECSManager();

        const sistemaActivo = new SistemaActivo();
        em.agregarSistema(sistemaActivo);

        const documentoFirmado: Activo = {
            nombre: "Activo1",
            contenido: "La contraseña secreta es 123",
            tipo: TipoActivo.DOCUMENTO,
            firma: "Firma Activo1"
        };
        const firma: Activo = {
            nombre: "Firma Activo1",
            contenido: "La contraseña secreta es 123",
            tipo: TipoActivo.FIRMA_DIGITAL,
            propietario: "Jacob"
        };
        const clavePublica: Activo = {
            nombre: "Clave_Publica_Jacob",
            tipo: TipoActivo.CLAVE_PUBLICA,
            propietario: "Jacob"
        };

        const hashDocumento = await sistemaActivo.calcularHashDocumento(documentoFirmado.contenido!);
        const hashFirma = await sistemaActivo.calcularHashFirma(firma, clavePublica);

        expect(hashDocumento).toEqual(hashFirma);
    });

    test("resultado incorrecto entre la firma de un documento y una clave pública diferente", async () => {
        const em = new ECSManager();
        
        const sistemaActivo = new SistemaActivo();
        em.agregarSistema(sistemaActivo);

        const documentoFirmado: Activo = {
            nombre: "Activo1",
            contenido: "La contraseña secreta es 123",
            tipo: TipoActivo.DOCUMENTO,
            firma: "Firma Activo1"
        };
        const firma: Activo = {
            nombre: "Firma Activo1",
            contenido: "La contraseña secreta es 123",
            tipo: TipoActivo.FIRMA_DIGITAL,
            propietario: "Jacob"
        };
        const clavePublica: Activo = {
            nombre: "Clave_Publica_Lisa",
            tipo: TipoActivo.CLAVE_PUBLICA,
            propietario: "Lisa"
        };
        
        const hashDocumento = await sistemaActivo.calcularHashDocumento(documentoFirmado.contenido!);
        const hashFirma = await sistemaActivo.calcularHashFirma(firma, clavePublica);

        expect(hashDocumento).not.toEqual(hashFirma);
    });
});
