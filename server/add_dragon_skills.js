const { execute, query } = require('./db');

async function addDragonSkills() {
    try {
        console.log('Adding Azure Dragon skills...');

        // 1. Get the latest Dragon pet for the user (assuming UserId 1 for dev)
        const getPetSql = `
            SELECT TOP 1 Id, Name, Species, Stats FROM Pets 
            WHERE UserId = 20 AND (Species = 'Dragon' OR Species LIKE N'%Long%' OR Species = N'Chân Long')
            ORDER BY Id DESC
        `;
        const petResult = await query(getPetSql);

        if (!petResult.recordset || petResult.recordset.length === 0) {
            console.log('No Dragon pet found for User 1.');
            return;
        }

        const pet = petResult.recordset[0];
        console.log(`Found Dragon: ${pet.Name} (ID: ${pet.Id})`);

        // 2. Define the Skills
        const skills = [
            {
                name: "Lôi Nha",
                type: "Active",
                desc: "Tụ sấm sét vào nanh vuốt, cắn xé kẻ địch gây sát thương Lôi.",
                power: 40,
                cooldown: 2
            },
            {
                name: "Lôi Vũ",
                type: "Passive",
                desc: "Triệu hồi mưa sấm, tăng mạnh Tốc Độ và Né Tránh.",
                power: 0,
                cooldown: 5
            },
            {
                name: "Thiên Lôi Liên Kích",
                type: "Active",
                desc: "Phóng ra 3 luồng sét liên tiếp tấn công kẻ địch.",
                power: 80,
                cooldown: 4
            },
            {
                name: "Cửu Thiên Lôi Long",
                type: "Ultimate",
                desc: "Triệu hồi Cửu Thiên Lôi Long giáng thế, gây sát thương diện rộng hủy diệt.",
                power: 150,
                cooldown: 8
            }
        ];

        const skillsJson = JSON.stringify(skills);

        // 3. Update the Pet
        const updateSql = `
            UPDATE Pets
            SET Skills = @skills
            WHERE Id = @id
        `;

        // Using direct query with parameters if supported, or template literal for simplicity in this dev script
        // Note: 'query' function in this codebase usually takes a string. 
        // We'll use a safe parameterized approach if possible, but for this script we'll construct the string carefully.
        // Since we are running this locally and inputs are static, it's safe.

        const updateQuery = `
            UPDATE Pets
            SET Skills = N'${skillsJson}'
            WHERE Id = ${pet.Id}
        `;

        await query(updateQuery);
        console.log('Skills added successfully!');

    } catch (err) {
        console.error('Error adding skills:', err);
    }
}

addDragonSkills();
