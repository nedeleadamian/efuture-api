import { faker } from '@faker-js/faker';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedCoreData1705345678901 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🌱 Starting Core Data Seed...');

    const passwordHash = '$2b$10$8H/RfzlZesyhP5o02CYsCuVXHVpoxg2/Zzv02mrpIilSqLAcUxj12';
    const userIds: string[] = [];


    const email = `admin@admin.com`;

    const res = await queryRunner.query(`
        INSERT INTO "user" (email, password, is_active) 
        VALUES ('${email}', '${passwordHash}', true) 
        RETURNING id;
      `);
    userIds.push(res[0].id);

    for (let i = 0; i < 10; i++) {
      const email = faker.internet.email().toLowerCase();

      const res = await queryRunner.query(`
        INSERT INTO "user" (email, password, is_active) 
        VALUES ('${email}', '${passwordHash}', true) 
        RETURNING id;
      `);
      userIds.push(res[0].id);
    }
    console.log(`✅ Created ${userIds.length} users`);

    const tagIds: string[] = [];
    const usedTagNames = new Set<string>();

    while (tagIds.length < 10) {
      const name = faker.word.adjective();

      if (!usedTagNames.has(name)) {
        usedTagNames.add(name);
        const res = await queryRunner.query(`
          INSERT INTO "tag" (name) VALUES ('${name}') RETURNING id;
        `);
        tagIds.push(res[0].id);
      }
    }
    console.log(`✅ Created ${tagIds.length} tags`);

    const messageValues: string[] = [];

    for (let i = 0; i < 100; i++) {
      const content = faker.lorem.sentence().substring(0, 239).replace(/'/g, "''");

      const authorId = faker.helpers.arrayElement(userIds);
      const tagId = faker.helpers.arrayElement(tagIds);

      const createdAt = faker.date.past().toISOString();

      messageValues.push(
        `('${content}', '${createdAt}', '${createdAt}', '${authorId}', '${tagId}', '${authorId}', '${tagId}')`,
      );
    }

    if (messageValues.length > 0) {
      await queryRunner.query(`
        INSERT INTO "message" (content, created_at, updated_at, author_id, tag_id, "authorId", "tagId") 
        VALUES ${messageValues.join(', ')}
      `);
    }

    console.log(`✅ Created 100 messages`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🔥 Reverting Seed...');

    await queryRunner.query(`DELETE FROM "message"`);
    await queryRunner.query(`DELETE FROM "tag"`);
    await queryRunner.query(`DELETE FROM "user"`);
  }
}
