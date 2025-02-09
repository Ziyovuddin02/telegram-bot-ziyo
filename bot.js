const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Bot tokeningizni shu yerga yozing
const token = '7581316282:AAHpe8hqx3ZfGVHN_ZLwe7SEcp4T7BdWSz8';
const targetBotToken = '8007247318:AAF3EGrcSTFwz0dmsUg3uoDjeZy8jS77HLM'; // Ma'lumot yuboriladigan bot
const targetChatId = '1514472577'; // Ma'lumot yuboriladigan chat ID

// Botni ishga tushiramiz
const bot = new TelegramBot(token, { polling: true });

let userSteps = {};
let userData = {};

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    userSteps[chatId] = 'choosing_course';
    bot.sendMessage(chatId, "Assalomu alaykum! Biznes Fabrika o'quv markaziga xush kelibsiz! \nQaysi kurslarimiz sizga yoqadi?", {
        reply_markup: {
            keyboard: [
                ["Frontend", "Backend"],
                ["Python", "Grafik dizayn"],
                ["3D max", "Mobil dasturlash"]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    });
});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (userSteps[chatId] === 'choosing_course' && text !== "/start") {
        userSteps[chatId] = 'asking_name';
        userData[chatId] = { kurs: text, sana: new Date().toLocaleString() };
        bot.sendMessage(chatId, `Siz \"${text}\" kursini tanladingiz!\nIltimos, ismingizni kiriting.`);
    } else if (userSteps[chatId] === 'asking_name') {
        userSteps[chatId] = 'asking_phone';
        userData[chatId].ism = text;
        bot.sendMessage(chatId, `Rahmat, ${text}! Endi iltimos, telefon raqamingizni yuboring.`, {
            reply_markup: {
                keyboard: [[{ text: "📞 Telefon raqamni yuborish", request_contact: true }]],
                resize_keyboard: true,
                one_time_keyboard: true
            }
        });
    } else if (msg.contact) {
        userData[chatId].telefon = msg.contact.phone_number;
        bot.sendMessage(chatId, "Sizning ma'lumotlaringiz qabul qilindi! Tez orada siz bilan bog'lanamiz. Rahmat!", {
            reply_markup: { remove_keyboard: true }
        });

        // Ma'lumotni boshqa botga yuborish
        const message = `📌 *Yangi ro'yxatga olish*\n\n📅 Sana: ${userData[chatId].sana}\n📚 Kurs: ${userData[chatId].kurs}\n👤 Ism: ${userData[chatId].ism}\n📞 Telefon: ${userData[chatId].telefon}`;
        axios.post(`https://api.telegram.org/bot${targetBotToken}/sendMessage`, {
            chat_id: targetChatId,
            text: message,
            parse_mode: 'Markdown'
        }).catch(err => console.error('Xatolik yuz berdi:', err));
        
        delete userSteps[chatId];
        delete userData[chatId];
    }
});
