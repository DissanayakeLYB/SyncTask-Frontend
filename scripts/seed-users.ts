/**
 * Seed Users Script for SyncTask
 *
 * This script creates default user accounts for development/demo purposes.
 *
 * Usage:
 *   npx tsx scripts/seed-users.ts
 *
 * Requirements:
 *   - SUPABASE_URL environment variable
 *   - SUPABASE_SERVICE_ROLE_KEY environment variable (NOT the anon key!)
 *
 * ⚠️  WARNING: Change these passwords in production!
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
	console.error("❌ Missing environment variables!");
	console.error("   Required: SUPABASE_URL (or VITE_SUPABASE_URL)");
	console.error("   Required: SUPABASE_SERVICE_ROLE_KEY");
	console.error("");
	console.error("   You can find these in your Supabase Dashboard:");
	console.error("   Settings > API > Project URL and service_role key");
	process.exit(1);
}

// Create admin client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
	auth: {
		autoRefreshToken: false,
		persistSession: false,
	},
});

// Default user accounts
const users = [
	// Admin account
	{
		email: "admin@synctask.com",
		password: "Admin@123",
		full_name: "System Admin",
		emoji: "👑",
		role: "admin" as const,
	},
	// Team member accounts
	{
		email: "nuwanga@synctask.com",
		password: "Nuwanga@123",
		full_name: "Nuwanga Akalanka",
		emoji: "📊",
		role: "member" as const,
	},
	{
		email: "charuka@synctask.com",
		password: "Charuka@123",
		full_name: "Charuka Abeysinghe",
		emoji: "🏅",
		role: "member" as const,
	},
	{
		email: "pramodi@synctask.com",
		password: "Pramodi@123",
		full_name: "Pramodi Rashmika",
		emoji: "🤣",
		role: "member" as const,
	},
	{
		email: "dileka@synctask.com",
		password: "Dileka@123",
		full_name: "Dileka Sathsarani",
		emoji: "🚀",
		role: "member" as const,
	},
	{
		email: "lasith@synctask.com",
		password: "Lasith@123",
		full_name: "Lasith Dissanayake",
		emoji: "💻",
		role: "member" as const,
	},
	{
		email: "ashen@synctask.com",
		password: "Ashen@123",
		full_name: "Ashen Gunasekara",
		emoji: "🐯",
		role: "member" as const,
	},
	{
		email: "warsha@synctask.com",
		password: "Warsha@123",
		full_name: "Warsha Yashodini",
		emoji: "🌧️",
		role: "member" as const,
	},
	{
		email: "dedunu@synctask.com",
		password: "Dedunu@123",
		full_name: "Nayomi Dedunu",
		emoji: "🌈",
		role: "member" as const,
	},
	{
		email: "shalitha@synctask.com",
		password: "Shalitha@123",
		full_name: "Shalitha Pathum",
		emoji: "😌",
		role: "member" as const,
	},
];

async function seedUsers() {
	console.log("🌱 Starting to seed users...\n");

	let created = 0;
	let skipped = 0;
	let errors = 0;

	for (const user of users) {
		try {
			// Create user in Supabase Auth
			const { data, error } = await supabase.auth.admin.createUser({
				email: user.email,
				password: user.password,
				email_confirm: true, // Auto-confirm email
				user_metadata: {
					full_name: user.full_name,
					emoji: user.emoji,
				},
			});

			if (error) {
				if (error.message.includes("already been registered")) {
					console.log(`⏭️  Skipped: ${user.email} (already exists)`);
					skipped++;
				} else {
					console.error(
						`❌ Error creating ${user.email}: ${error.message}`,
					);
					errors++;
				}
				continue;
			}

			// Update role if admin
			if (data.user && user.role === "admin") {
				const { error: updateError } = await supabase
					.from("profiles")
					.update({ role: "admin" })
					.eq("id", data.user.id);

				if (updateError) {
					console.error(
						`⚠️  Created ${user.email} but failed to set admin role`,
					);
				}
			}

			console.log(`✅ Created: ${user.email} (${user.role})`);
			created++;
		} catch (err) {
			console.error(`❌ Unexpected error for ${user.email}:`, err);
			errors++;
		}
	}

	console.log("\n" + "=".repeat(50));
	console.log("📊 Seed Summary:");
	console.log(`   ✅ Created: ${created}`);
	console.log(`   ⏭️  Skipped: ${skipped}`);
	console.log(`   ❌ Errors:  ${errors}`);
	console.log("=".repeat(50));

	if (created > 0) {
		console.log("\n📋 Default Credentials:");
		console.log("   Admin: admin@synctask.com / Admin@123");
		console.log("   Members: [firstname]@synctask.com / [Firstname]@123");
		console.log("\n⚠️  Remember to change passwords in production!");
	}
}

seedUsers().catch(console.error);
