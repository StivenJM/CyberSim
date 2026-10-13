import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import type { Prisma } from '../src/generated/prisma/index.js';
import bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });

const clientOptions: Prisma.PrismaClientOptions = {
  adapter,
  log: ['error', 'warn'] as Prisma.LogLevel[],
};

const prisma = new PrismaClient(clientOptions);

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...\n');

  const hashedPassword = await bcrypt.hash('password123', 10);

  console.log('👨‍🏫 Creando profesor...');
  const profesor = await prisma.profesor.create({
    data: {
      primernombre: 'Juan',
      segundo_nombre: 'Carlos',
      primer_apellido: 'García',
      segundo_apellido: 'López',
      usuario_auth: {
        create: {
          correo_electronico: 'profesor@test.com',
          contrasenia_hash: hashedPassword,
          confirmado: true,
        }
      }
    },
    include: { usuario_auth: true } // Para poder mostrar el correo en el log
  });
  console.log(`✅ Profesor creado: ${profesor.usuario_auth?.correo_electronico}`);

  // Eliminamos la creación del escenario porque la tabla ya no existe en el esquema.

  console.log('\n📖 Creando curso...');
  const expiracion = new Date();
  expiracion.setMonth(expiracion.getMonth() + 3);
  
  const curso = await prisma.curso.create({
    data: {
      id_profesor: profesor.id_profesor,
      nombre: 'Ciberseguridad 101',
      codigo_acceso: 'CYBER2024',
      codigo_expira: expiracion,
    },
  });
  console.log(`✅ Curso creado: ${curso.nombre} (Código: ${curso.codigo_acceso})`);

  console.log('\n👨‍🎓 Creando estudiantes...');
  const estudiante1 = await prisma.estudiante.create({
    data: {
      codigo_unico: 20240001,
      primernombre: 'María',
      segundo_nombre: 'Fernanda',
      primer_apellido: 'Rodríguez',
      segundo_apellido: 'Martínez',
      usuario_auth: {
        create: {
          correo_electronico: 'estudiante1@test.com',
          contrasenia_hash: hashedPassword,
          confirmado: true,
        }
      }
    },
    include: { usuario_auth: true }
  });
  console.log(`✅ Estudiante 1: ${estudiante1.usuario_auth?.correo_electronico}`);

  const estudiante2 = await prisma.estudiante.create({
    data: {
      codigo_unico: 20240002,
      primernombre: 'Pedro',
      segundo_nombre: 'Antonio',
      primer_apellido: 'Sánchez',
      segundo_apellido: 'Torres',
      usuario_auth: {
        create: {
          correo_electronico: 'estudiante2@test.com',
          contrasenia_hash: hashedPassword,
          confirmado: true,
        }
      }
    },
    include: { usuario_auth: true }
  });
  console.log(`✅ Estudiante 2: ${estudiante2.usuario_auth?.correo_electronico}`);

  console.log('\n📝 Matriculando estudiantes en el curso...');
  await prisma.matricula.create({
    data: {
      id_curso: curso.id_curso,
      id_estudiante: estudiante1.id_estudiante,
    },
  });
  console.log(`✅ ${estudiante1.primernombre} matriculado`);

  await prisma.matricula.create({
    data: {
      id_curso: curso.id_curso,
      id_estudiante: estudiante2.id_estudiante,
    },
  });
  console.log(`✅ ${estudiante2.primernombre} matriculado`);

  console.log('\n📊 Creando progreso inicial...');
  await prisma.progreso.create({
    data: {
      id_estudiante: estudiante1.id_estudiante,
      slug_escenario: 'control-acceso', // Ahora usamos el slug en lugar de ID
      terminado: false,
      tiempo: 0,
    },
  });
  console.log(`✅ Progreso creado para ${estudiante1.primernombre}`);

  console.log('\n✨ Seed completado exitosamente!\n');
  console.log('📋 Credenciales de prueba:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👨‍🏫 PROFESOR:');
  console.log('   Email: profesor@test.com');
  console.log('   Password: password123');
  console.log('\n👨‍🎓 ESTUDIANTE 1:');
  console.log('   Email: estudiante1@test.com');
  console.log('   Password: password123');
  console.log('\n👨‍🎓 ESTUDIANTE 2:');
  console.log('   Email: estudiante2@test.com');
  console.log('   Password: password123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
