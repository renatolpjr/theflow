
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function seedDatabase() {
  console.log('🌱 Starting database seed...');

  try {
    // Create default admin user (test account)
    const hashedPassword = await bcrypt.hash('johndoe123', 10);
    
    const adminUser = await prisma.user.upsert({
      where: { email: 'john@doe.com' },
      update: {
        role: 'admin', // Update existing user to admin
      },
      create: {
        email: 'john@doe.com',
        name: 'John Doe',
        password: hashedPassword,
        role: 'admin',
        totalPoints: 1000,
        level: 5,
        streak: 10,
      },
    });

    console.log('✅ Admin user created:', adminUser.email);

    // Load English content
    const contentPath = path.join(process.cwd(), 'public', 'english_content.json');
    const contentData = JSON.parse(fs.readFileSync(contentPath, 'utf8'));

    // Seed lessons from JSON content
    for (const lessonData of contentData.lessons) {
      await prisma.lesson.upsert({
        where: { lessonId: lessonData.lesson_id },
        update: {},
        create: {
          lessonId: lessonData.lesson_id,
          title: lessonData.title,
          difficulty: lessonData.difficulty,
          topics: lessonData.topics,
          vocabulary: lessonData.vocabulary,
          phrases: lessonData.phrases || [],
          sentences: lessonData.example_sentences || [],
          dialogues: lessonData.dialogues || [],
          exercises: lessonData.exercises || [],
          speakingPrompts: lessonData.speaking_prompts || [],
          isUnlocked: true,
          requiredLevel: lessonData.difficulty === 'Beginner' ? 1 : lessonData.difficulty === 'Intermediate' ? 3 : 5,
        },
      });
    }

    console.log(`✅ ${contentData.lessons.length} lessons seeded`);

    // Seed badges
    const badges = [
      {
        name: 'First Steps',
        description: 'Complete your first lesson',
        icon: '🎯',
        category: 'progress',
        requirement: { type: 'lessons_completed', count: 1 },
        points: 50,
        rarity: 'common'
      },
      {
        name: 'Quick Learner',
        description: 'Complete 5 lessons',
        icon: '⚡',
        category: 'progress', 
        requirement: { type: 'lessons_completed', count: 5 },
        points: 200,
        rarity: 'common'
      },
      {
        name: 'Vocabulary Master',
        description: 'Complete 50 vocabulary exercises',
        icon: '📚',
        category: 'vocabulary',
        requirement: { type: 'vocabulary_exercises', count: 50 },
        points: 300,
        rarity: 'rare'
      },
      {
        name: 'Speaking Star',
        description: 'Complete 20 speaking challenges',
        icon: '🎤',
        category: 'speaking',
        requirement: { type: 'speaking_exercises', count: 20 },
        points: 250,
        rarity: 'rare'
      },
      {
        name: 'Perfect Score',
        description: 'Get 100% on any lesson',
        icon: '⭐',
        category: 'achievement',
        requirement: { type: 'perfect_score', count: 1 },
        points: 100,
        rarity: 'rare'
      },
      {
        name: 'Week Warrior',
        description: 'Practice 7 days in a row',
        icon: '🔥',
        category: 'streak',
        requirement: { type: 'daily_streak', count: 7 },
        points: 150,
        rarity: 'rare'
      },
      {
        name: 'Points Collector',
        description: 'Earn 1000 points',
        icon: '💰',
        category: 'points',
        requirement: { type: 'total_points', count: 1000 },
        points: 200,
        rarity: 'epic'
      },
      {
        name: 'Level Up',
        description: 'Reach level 5',
        icon: '🚀',
        category: 'level',
        requirement: { type: 'user_level', count: 5 },
        points: 500,
        rarity: 'epic'
      },
      {
        name: 'English Expert',
        description: 'Complete all available lessons',
        icon: '🏆',
        category: 'completion',
        requirement: { type: 'all_lessons_completed', count: 1 },
        points: 1000,
        rarity: 'legendary'
      }
    ];

    for (const badgeData of badges) {
      await prisma.badge.upsert({
        where: { name: badgeData.name },
        update: {},
        create: badgeData,
      });
    }

    console.log(`✅ ${badges.length} badges seeded`);

    // Seed achievements  
    const achievements = [
      {
        name: 'Daily Practice',
        description: 'Complete exercises today',
        category: 'daily',
        target: 1,
        points: 25
      },
      {
        name: 'Weekly Goal',
        description: 'Complete 5 lessons this week',
        category: 'weekly',
        target: 5,
        points: 100
      },
      {
        name: 'Monthly Champion',
        description: 'Complete 20 lessons this month',
        category: 'monthly', 
        target: 20,
        points: 500
      },
      {
        name: 'Point Milestone',
        description: 'Earn 500 points total',
        category: 'milestone',
        target: 500,
        points: 100
      },
      {
        name: 'Streak Master',
        description: 'Maintain a 30-day streak',
        category: 'streak',
        target: 30,
        points: 750
      }
    ];

    for (const achievementData of achievements) {
      await prisma.achievement.upsert({
        where: { name: achievementData.name },
        update: {},
        create: achievementData,
      });
    }

    console.log(`✅ ${achievements.length} achievements seeded`);

    // Seed challenges
    const challenges = [
      {
        title: 'Daily Vocabulary Boost',
        description: 'Test your knowledge of basic English vocabulary with this quick challenge!',
        difficulty: 'Beginner',
        type: 'vocabulary',
        category: 'daily',
        questions: [
          {
            type: 'multiple_choice',
            question: 'What is the meaning of "bread"?',
            options: ['Pão', 'Leite', 'Café', 'Água'],
            correctAnswer: 'Pão'
          },
          {
            type: 'multiple_choice',
            question: 'What is the translation of "drink"?',
            options: ['Comer', 'Beber', 'Dormir', 'Correr'],
            correctAnswer: 'Beber'
          },
          {
            type: 'fill_blank',
            question: 'I ___ coffee every morning.',
            correctAnswer: 'drink'
          },
          {
            type: 'multiple_choice',
            question: 'What is "egg" in Portuguese?',
            options: ['Ovo', 'Queijo', 'Presunto', 'Pão'],
            correctAnswer: 'Ovo'
          },
          {
            type: 'fill_blank',
            question: 'She ___ cereal for breakfast.',
            correctAnswer: 'eats'
          }
        ],
        timeLimit: 300,
        passingScore: 70,
        maxAttempts: 3,
        pointsReward: 100,
        requiredLevel: 1,
        order: 1,
        tags: ['vocabulary', 'food', 'daily']
      },
      {
        title: 'Grammar Master: Present Simple',
        description: 'Practice the present simple tense with various exercises.',
        difficulty: 'Beginner',
        type: 'grammar',
        category: 'weekly',
        questions: [
          {
            type: 'multiple_choice',
            question: 'I ___ to school every day.',
            options: ['go', 'goes', 'going', 'went'],
            correctAnswer: 'go'
          },
          {
            type: 'multiple_choice',
            question: 'She ___ English very well.',
            options: ['speak', 'speaks', 'speaking', 'spoke'],
            correctAnswer: 'speaks'
          },
          {
            type: 'fill_blank',
            question: 'They ___ (play) soccer on weekends.',
            correctAnswer: 'play'
          },
          {
            type: 'multiple_choice',
            question: 'He ___ his homework after dinner.',
            options: ['do', 'does', 'doing', 'did'],
            correctAnswer: 'does'
          },
          {
            type: 'true_false',
            question: 'We uses computers at work. (Is this correct?)',
            correctAnswer: 'false'
          },
          {
            type: 'fill_blank',
            question: 'My sister ___ (love) chocolate.',
            correctAnswer: 'loves'
          }
        ],
        timeLimit: 420,
        passingScore: 75,
        maxAttempts: 2,
        pointsReward: 150,
        requiredLevel: 2,
        order: 2,
        tags: ['grammar', 'present-simple', 'weekly']
      },
      {
        title: 'Conversation Challenge',
        description: 'Complete dialogues with appropriate responses. Test your conversational skills!',
        difficulty: 'Intermediate',
        type: 'mixed',
        category: 'special',
        questions: [
          {
            type: 'multiple_choice',
            question: 'A: "How are you today?"\nB: "___"',
            options: ['I\'m fine, thank you!', 'Yes, I am.', 'No, I don\'t.', 'I have 5.'],
            correctAnswer: 'I\'m fine, thank you!'
          },
          {
            type: 'multiple_choice',
            question: 'A: "Would you like some coffee?"\nB: "___"',
            options: ['Yes, please.', 'No, I am not.', 'I like it.', 'Coffee is black.'],
            correctAnswer: 'Yes, please.'
          },
          {
            type: 'fill_blank',
            question: 'A: "What\'s your name?"\nB: "My name ___ Maria."',
            correctAnswer: 'is'
          },
          {
            type: 'multiple_choice',
            question: 'A: "Where are you from?"\nB: "___"',
            options: ['I\'m from Brazil.', 'I from Brazil.', 'I\'m Brazil.', 'From I Brazil.'],
            correctAnswer: 'I\'m from Brazil.'
          }
        ],
        timeLimit: 360,
        passingScore: 80,
        maxAttempts: 3,
        pointsReward: 200,
        badgeReward: 'Conversation Master',
        requiredLevel: 3,
        order: 3,
        tags: ['conversation', 'dialogue', 'intermediate']
      },
      {
        title: 'Advanced Reading Comprehension',
        description: 'Read a short text and answer questions about it. Challenge your understanding!',
        difficulty: 'Advanced',
        type: 'mixed',
        category: 'special',
        questions: [
          {
            type: 'reading_passage',
            passage: 'Sarah is a teacher from New York. She teaches English to international students. Every morning, she wakes up at 6 AM and prepares her lessons. She loves her job because she meets people from different countries. In her free time, Sarah enjoys reading books and traveling.',
            questions: [
              {
                type: 'multiple_choice',
                question: 'What does Sarah do for a living?',
                options: ['She is a doctor', 'She is a teacher', 'She is a nurse', 'She is a student'],
                correctAnswer: 'She is a teacher'
              },
              {
                type: 'multiple_choice',
                question: 'What time does Sarah wake up?',
                options: ['5 AM', '6 AM', '7 AM', '8 AM'],
                correctAnswer: '6 AM'
              },
              {
                type: 'true_false',
                question: 'Sarah teaches English to local students.',
                correctAnswer: 'false'
              },
              {
                type: 'multiple_choice',
                question: 'What does Sarah enjoy in her free time?',
                options: ['Cooking and dancing', 'Reading and traveling', 'Sports and music', 'Shopping and movies'],
                correctAnswer: 'Reading and traveling'
              }
            ]
          }
        ],
        timeLimit: 600,
        passingScore: 85,
        maxAttempts: 2,
        pointsReward: 300,
        requiredLevel: 5,
        order: 4,
        tags: ['reading', 'comprehension', 'advanced']
      },
      {
        title: 'Quick Pronunciation Check',
        description: 'Listen and identify the correct pronunciation of common English words.',
        difficulty: 'Beginner',
        type: 'listening',
        category: 'daily',
        questions: [
          {
            type: 'multiple_choice',
            question: 'Which word has the /i:/ sound (like "see")?',
            options: ['sit', 'seat', 'set', 'sat'],
            correctAnswer: 'seat'
          },
          {
            type: 'multiple_choice',
            question: 'Which word rhymes with "cat"?',
            options: ['cut', 'coat', 'hat', 'hot'],
            correctAnswer: 'hat'
          },
          {
            type: 'multiple_choice',
            question: 'Which word has the /u:/ sound (like "food")?',
            options: ['look', 'book', 'moon', 'good'],
            correctAnswer: 'moon'
          }
        ],
        timeLimit: 180,
        passingScore: 70,
        maxAttempts: 5,
        pointsReward: 80,
        requiredLevel: 1,
        order: 5,
        tags: ['pronunciation', 'listening', 'phonics']
      }
    ];

    for (const challengeData of challenges) {
      await prisma.challenge.upsert({
        where: { id: challengeData.title }, // Use title as temporary unique identifier
        update: {},
        create: challengeData,
      }).catch(() => {
        // If title doesn't work as unique identifier, just create
        return prisma.challenge.create({ data: challengeData });
      });
    }

    console.log(`✅ ${challenges.length} challenges seeded`);

    // Seed video lessons
    const videoLessons = [
      {
        title: 'English Alphabet and Pronunciation',
        description: 'Learn the English alphabet with correct pronunciation. Perfect for beginners starting their English journey!',
        thumbnail: '/videos/thumbnails/alphabet.jpg',
        videoUrl: 'https://www.youtube.com/embed/IwqM0Z79vEU',
        duration: 480,
        category: 'pronunciation',
        difficulty: 'Beginner',
        order: 1,
        tags: ['alphabet', 'pronunciation', 'basics'],
        transcript: 'In this lesson, we will learn the English alphabet from A to Z with proper pronunciation...',
        requiredLevel: 1,
        isPublic: true,
        isPremium: false
      },
      {
        title: 'Greetings and Introductions',
        description: 'Master the art of greeting people and introducing yourself in English. Essential for everyday conversations!',
        thumbnail: '/videos/thumbnails/greetings.jpg',
        videoUrl: 'https://www.youtube.com/embed/oPkv3p1b1XY',
        duration: 600,
        category: 'conversation',
        difficulty: 'Beginner',
        order: 2,
        tags: ['greetings', 'introductions', 'conversation'],
        transcript: 'Hello everyone! Today we\'ll learn how to greet people and introduce yourself in English...',
        requiredLevel: 1,
        isPublic: true,
        isPremium: false
      },
      {
        title: 'Numbers 1-100',
        description: 'Learn to count from 1 to 100 in English. Practice pronunciation and learn practical uses of numbers.',
        thumbnail: '/videos/thumbnails/numbers.jpg',
        videoUrl: 'https://www.youtube.com/embed/Ac44TKe35Qo',
        duration: 540,
        category: 'vocabulary',
        difficulty: 'Beginner',
        order: 3,
        tags: ['numbers', 'counting', 'vocabulary'],
        transcript: 'Let\'s learn numbers in English! We\'ll start with 1, 2, 3...',
        requiredLevel: 1,
        isPublic: true,
        isPremium: false
      },
      {
        title: 'Present Simple Tense Explained',
        description: 'Comprehensive guide to using the present simple tense. Learn rules, usage, and common mistakes.',
        thumbnail: '/videos/thumbnails/present-simple.jpg',
        videoUrl: 'https://www.youtube.com/embed/VRFk6ZLJZdw',
        duration: 720,
        category: 'grammar',
        difficulty: 'Intermediate',
        order: 4,
        tags: ['grammar', 'present-simple', 'tenses'],
        transcript: 'The present simple tense is one of the most important tenses in English. We use it to talk about...',
        requiredLevel: 2,
        isPublic: true,
        isPremium: false
      },
      {
        title: 'Common Phrasal Verbs',
        description: 'Learn the most common phrasal verbs used in everyday English. Includes examples and practice exercises.',
        thumbnail: '/videos/thumbnails/phrasal-verbs.jpg',
        videoUrl: 'https://www.youtube.com/embed/gm31AB4Lr1Q',
        duration: 900,
        category: 'vocabulary',
        difficulty: 'Intermediate',
        order: 5,
        tags: ['phrasal-verbs', 'vocabulary', 'idioms'],
        transcript: 'Phrasal verbs are combinations of verbs with prepositions or adverbs. For example, "give up" means...',
        requiredLevel: 3,
        isPublic: true,
        isPremium: false
      },
      {
        title: 'Business English: Email Writing',
        description: 'Master professional email writing in English. Learn structure, tone, and common phrases for business communication.',
        thumbnail: '/videos/thumbnails/business-email.jpg',
        videoUrl: 'https://www.youtube.com/embed/TqIqw_VKS8E',
        duration: 840,
        category: 'business',
        difficulty: 'Advanced',
        order: 6,
        tags: ['business', 'writing', 'email', 'professional'],
        transcript: 'In today\'s global business world, writing professional emails in English is essential...',
        resources: {
          downloadables: [
            { name: 'Email Templates', url: '/resources/email-templates.pdf' },
            { name: 'Common Phrases Guide', url: '/resources/business-phrases.pdf' }
          ]
        },
        requiredLevel: 4,
        isPublic: true,
        isPremium: true
      },
      {
        title: 'American vs British English',
        description: 'Explore the differences between American and British English in vocabulary, spelling, and pronunciation.',
        thumbnail: '/videos/thumbnails/us-uk-english.jpg',
        videoUrl: 'https://www.youtube.com/embed/1xWFBJU2dWs',
        duration: 660,
        category: 'culture',
        difficulty: 'Intermediate',
        order: 7,
        tags: ['culture', 'vocabulary', 'pronunciation', 'differences'],
        transcript: 'Did you know that British people say "lift" while Americans say "elevator"? Let\'s explore more...',
        requiredLevel: 3,
        isPublic: true,
        isPremium: false
      },
      {
        title: 'Advanced Listening Practice',
        description: 'Challenge your listening skills with fast-paced conversations and authentic English audio.',
        thumbnail: '/videos/thumbnails/advanced-listening.jpg',
        videoUrl: 'https://www.youtube.com/embed/mTjwNR-jPlk',
        duration: 1080,
        category: 'listening',
        difficulty: 'Advanced',
        order: 8,
        tags: ['listening', 'comprehension', 'advanced', 'practice'],
        transcript: 'This advanced listening practice features real conversations at natural speed...',
        requiredLevel: 5,
        isPublic: true,
        isPremium: true
      }
    ];

    for (const videoData of videoLessons) {
      await prisma.videoLesson.upsert({
        where: { id: videoData.title }, // Use title as temporary unique identifier
        update: {},
        create: videoData,
      }).catch(() => {
        // If title doesn't work as unique identifier, just create
        return prisma.videoLesson.create({ data: videoData });
      });
    }

    console.log(`✅ ${videoLessons.length} video lessons seeded`);

    // Seed Listening Exercises
    console.log('Seeding listening exercises...');
    const listeningExercises = [
      {
        title: 'Daily Conversation at a Cafe',
        description: 'Listen to a typical conversation at an American coffee shop',
        difficulty: 'Beginner',
        category: 'conversation',
        audioText: `Customer: Hi, I'd like a medium coffee with milk, please.
Barista: Sure! Would you like that hot or iced?
Customer: Hot, please. And can I also get a blueberry muffin?
Barista: Of course! That'll be $6.50. Will that be cash or card?
Customer: Card, please.
Barista: Great! Your order will be ready in just a moment.`,
        voice: 'american-female',
        speed: 1.0,
        questions: [
          {
            question: 'What size coffee did the customer order?',
            type: 'multiple_choice',
            options: ['Small', 'Medium', 'Large', 'Extra Large'],
            correctAnswer: 'Medium'
          },
          {
            question: 'What food item did the customer order?',
            type: 'multiple_choice',
            options: ['Chocolate muffin', 'Blueberry muffin', 'Banana bread', 'Cookie'],
            correctAnswer: 'Blueberry muffin'
          },
          {
            question: 'How much was the total?',
            type: 'multiple_choice',
            options: ['$5.50', '$6.00', '$6.50', '$7.00'],
            correctAnswer: '$6.50'
          }
        ],
        isActive: true,
        requiredLevel: 1,
        order: 1,
        tags: ['beginner', 'shopping', 'daily-life']
      },
      {
        title: 'Weather Forecast Report',
        description: 'Listen to a weather forecast for the week',
        difficulty: 'Intermediate',
        category: 'news',
        audioText: `Good morning! Here's your weather forecast for this week. 
Today we'll see mostly sunny skies with temperatures reaching 75 degrees Fahrenheit. 
Tomorrow, expect some clouds in the afternoon with a high of 72 degrees. 
Wednesday will bring rain showers, so don't forget your umbrella! 
Temperatures will drop to around 65 degrees. 
Thursday and Friday look much better with clear skies and temperatures climbing back to the mid-70s. 
Have a great week!`,
        voice: 'american-male',
        speed: 1.0,
        questions: [
          {
            question: 'What will the weather be like today?',
            type: 'multiple_choice',
            options: ['Rainy', 'Mostly sunny', 'Cloudy', 'Stormy'],
            correctAnswer: 'Mostly sunny'
          },
          {
            question: 'Which day will it rain?',
            type: 'multiple_choice',
            options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
            correctAnswer: 'Wednesday'
          },
          {
            question: 'What will the temperature be on Wednesday?',
            type: 'multiple_choice',
            options: ['75°F', '72°F', '65°F', '70°F'],
            correctAnswer: '65°F'
          }
        ],
        isActive: true,
        requiredLevel: 2,
        order: 2,
        tags: ['intermediate', 'weather', 'news']
      },
      {
        title: 'American History: The Declaration of Independence',
        description: 'Learn about one of the most important documents in American history',
        difficulty: 'Advanced',
        category: 'story',
        audioText: `The Declaration of Independence, adopted on July 4th, 1776, is one of the most significant documents in American history. 
Written primarily by Thomas Jefferson, it formally announced the thirteen American colonies' separation from Great Britain. 
The document begins with a powerful preamble stating that all men are created equal and have unalienable rights including life, liberty, and the pursuit of happiness. 
It lists grievances against King George III and explains why the colonies felt compelled to break away. 
This revolutionary document inspired similar movements around the world and continues to be celebrated every year on Independence Day.`,
        voice: 'american-male',
        speed: 0.9,
        questions: [
          {
            question: 'Who was the primary author of the Declaration of Independence?',
            type: 'multiple_choice',
            options: ['George Washington', 'Benjamin Franklin', 'Thomas Jefferson', 'John Adams'],
            correctAnswer: 'Thomas Jefferson'
          },
          {
            question: 'When was the Declaration of Independence adopted?',
            type: 'multiple_choice',
            options: ['July 4, 1775', 'July 4, 1776', 'July 4, 1777', 'August 4, 1776'],
            correctAnswer: 'July 4, 1776'
          },
          {
            question: 'What are the three unalienable rights mentioned?',
            type: 'multiple_choice',
            options: ['Life, liberty, and property', 'Life, liberty, and pursuit of happiness', 'Freedom, justice, and equality', 'Rights, freedom, and justice'],
            correctAnswer: 'Life, liberty, and pursuit of happiness'
          }
        ],
        isActive: true,
        requiredLevel: 3,
        order: 3,
        tags: ['advanced', 'history', 'culture']
      }
    ];

    for (const exercise of listeningExercises) {
      const existing = await prisma.listeningExercise.findFirst({
        where: { title: exercise.title }
      });
      
      if (!existing) {
        await prisma.listeningExercise.create({ data: exercise });
      }
    }

    console.log(`✅ ${listeningExercises.length} listening exercises seeded`);

    // Seed Speaking Exercises
    console.log('Seeding speaking exercises...');
    const speakingExercises = [
      {
        title: 'Introduce Yourself',
        description: 'Practice introducing yourself in English',
        difficulty: 'Beginner',
        category: 'conversation',
        prompt: 'Introduce yourself to a new friend. Include your name, where you\'re from, what you do, and one interesting hobby you have. Speak for at least 30 seconds.',
        context: 'Imagine you\'re at a social event and meeting someone for the first time.',
        targetWords: ['name', 'from', 'work', 'study', 'hobby', 'enjoy', 'like'],
        minDuration: 30,
        maxDuration: 60,
        isActive: true,
        requiredLevel: 1,
        order: 1,
        tags: ['beginner', 'introduction', 'social']
      },
      {
        title: 'Describe Your Favorite Place',
        description: 'Describe a place you love to visit',
        difficulty: 'Intermediate',
        category: 'description',
        prompt: 'Describe your favorite place to visit. Explain where it is, what it looks like, what you can do there, and why you love it. Try to use descriptive adjectives and speak for at least 1 minute.',
        context: 'Think of a place that brings you joy - it could be a park, a beach, a city, or even a room in your house.',
        targetWords: ['located', 'beautiful', 'peaceful', 'exciting', 'atmosphere', 'scenery', 'relaxing', 'memorable'],
        minDuration: 60,
        maxDuration: 120,
        isActive: true,
        requiredLevel: 2,
        order: 2,
        tags: ['intermediate', 'description', 'travel']
      },
      {
        title: 'Present Your Opinion on Technology',
        description: 'Share your views on technology\'s impact on society',
        difficulty: 'Advanced',
        category: 'presentation',
        prompt: 'Present your opinion on how technology has changed the way we communicate. Discuss both positive and negative aspects, provide examples, and conclude with your overall perspective. Speak for 1.5 to 2 minutes.',
        context: 'This is a formal presentation. Structure your thoughts clearly with an introduction, main points, and conclusion.',
        targetWords: ['communication', 'social media', 'connectivity', 'isolation', 'convenience', 'privacy', 'innovation', 'balance'],
        minDuration: 90,
        maxDuration: 120,
        isActive: true,
        requiredLevel: 3,
        order: 3,
        tags: ['advanced', 'opinion', 'technology', 'presentation']
      }
    ];

    for (const exercise of speakingExercises) {
      const existing = await prisma.speakingExercise.findFirst({
        where: { title: exercise.title }
      });
      
      if (!existing) {
        await prisma.speakingExercise.create({ data: exercise });
      }
    }

    console.log(`✅ ${speakingExercises.length} speaking exercises seeded`);

    console.log('🎉 Database seed completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
