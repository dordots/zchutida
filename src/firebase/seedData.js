// Seed Data Script for Firestore
// This script creates sample data for development
// Run this once to populate your Firestore database with test data

import { setDocument } from './firestore';

// Sample data
const sampleMentees = [
  {
    full_name: 'יוסי כהן',
    id_number: '123456789',
    institution: 'אוניברסיטת תל אביב',
    study_confirmation_url: 'https://example.com/study1.pdf',
    aid_fund_confirmation_url: 'https://example.com/aid1.pdf',
    payment_receipt_url: 'https://example.com/payment1.pdf',
    admin_approved: true,
    status: 'admin_approved',
    hours_balance: 10,
    profile_complete: true,
    email: 'yossi@example.com',
    phone: '050-1234567'
  },
  {
    full_name: 'שרה לוי',
    id_number: '987654321',
    institution: 'הטכניון',
    study_confirmation_url: 'https://example.com/study2.pdf',
    aid_fund_confirmation_url: 'https://example.com/aid2.pdf',
    payment_receipt_url: 'https://example.com/payment2.pdf',
    admin_approved: true,
    status: 'admin_approved',
    hours_balance: 15,
    profile_complete: true,
    email: 'sara@example.com',
    phone: '052-7654321'
  },
  {
    full_name: 'דוד ישראלי',
    id_number: '111222333',
    institution: 'אוניברסיטת בר אילן',
    study_confirmation_url: 'https://example.com/study3.pdf',
    aid_fund_confirmation_url: 'https://example.com/aid3.pdf',
    payment_receipt_url: 'https://example.com/payment3.pdf',
    admin_approved: false,
    status: 'pending_admin_approval',
    hours_balance: 0,
    profile_complete: true,
    email: 'david@example.com',
    phone: '054-1112233'
  }
];

const sampleMentors = [
  {
    full_name: 'פרופ\' רונית שטרן',
    id_number: '444555666',
    institution: 'אוניברסיטת תל אביב',
    profile_image_url: 'https://via.placeholder.com/150',
    study_confirmation_url: 'https://example.com/mentor_study1.pdf',
    mentoring_subjects: ['מתמטיקה', 'פיזיקה', 'מדעי המחשב'],
    employment_procedure_url: 'https://example.com/employment1.pdf',
    form_101_url: 'https://example.com/form101_1.pdf',
    commitment_letter_url: 'https://example.com/commitment1.pdf',
    bio: 'פרופסור למתמטיקה עם ניסיון של 15 שנים בהוראה',
    experience_years: 15,
    hourly_rate: 150,
    admin_approved: true,
    status: 'approved',
    profile_complete: true,
    available: true,
    available_slots: [
      {
        day: 'sunday',
        start_time: '10:00',
        end_time: '12:00',
        type: 'recurring'
      },
      {
        day: 'tuesday',
        start_time: '14:00',
        end_time: '16:00',
        type: 'recurring'
      },
      {
        day: 'thursday',
        start_time: '10:00',
        end_time: '12:00',
        type: 'recurring'
      }
    ],
    email: 'ronit@example.com',
    phone: '050-4445566'
  },
  {
    full_name: 'ד\"ר משה אברהם',
    id_number: '777888999',
    institution: 'הטכניון',
    profile_image_url: 'https://via.placeholder.com/150',
    study_confirmation_url: 'https://example.com/mentor_study2.pdf',
    mentoring_subjects: ['אנגלית', 'עברית', 'ספרות'],
    employment_procedure_url: 'https://example.com/employment2.pdf',
    form_101_url: 'https://example.com/form101_2.pdf',
    commitment_letter_url: 'https://example.com/commitment2.pdf',
    bio: 'דוקטור לספרות עברית, מומחה בהוראת שפות',
    experience_years: 8,
    hourly_rate: 120,
    admin_approved: true,
    status: 'approved',
    profile_complete: true,
    available: true,
    available_slots: [
      {
        day: 'monday',
        start_time: '09:00',
        end_time: '11:00',
        type: 'recurring'
      },
      {
        day: 'wednesday',
        start_time: '15:00',
        end_time: '17:00',
        type: 'recurring'
      }
    ],
    email: 'moshe@example.com',
    phone: '052-7778899'
  },
  {
    full_name: 'ד\"ר רחל כהן',
    id_number: '222333444',
    institution: 'אוניברסיטת בר אילן',
    profile_image_url: 'https://via.placeholder.com/150',
    study_confirmation_url: 'https://example.com/mentor_study3.pdf',
    mentoring_subjects: ['כימיה', 'ביולוגיה'],
    employment_procedure_url: 'https://example.com/employment3.pdf',
    form_101_url: 'https://example.com/form101_3.pdf',
    commitment_letter_url: 'https://example.com/commitment3.pdf',
    bio: 'דוקטור לכימיה, מתמחה בהוראת מדעים',
    experience_years: 12,
    hourly_rate: 140,
    admin_approved: false,
    status: 'pending_approval',
    profile_complete: true,
    available: false,
    available_slots: [],
    email: 'rachel@example.com',
    phone: '054-2223344'
  }
];

const sampleAdmins = [
  {
    full_name: 'מנהל המערכת',
    id_number: '000000000',
    email: 'admin@zchutyeda.com',
    phone: '050-0000000',
    role: 'admin'
  }
];

/**
 * Generate sample sessions
 */
const generateSampleSessions = (mentees, mentors) => {
  const sessions = [];
  const statuses = ['pending', 'approved', 'approved', 'rejected']; // More approved than rejected
  
  // Create sessions for approved mentees and mentors
  const approvedMentees = mentees.filter(m => m.admin_approved);
  const approvedMentors = mentors.filter(m => m.admin_approved && m.available);
  
  if (approvedMentees.length === 0 || approvedMentors.length === 0) {
    return sessions;
  }
  
  // Generate sessions for the next 30 days
  for (let i = 0; i < 10; i++) {
    const mentee = approvedMentees[Math.floor(Math.random() * approvedMentees.length)];
    const mentor = approvedMentors[Math.floor(Math.random() * approvedMentors.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    // Random date in next 30 days
    const date = new Date();
    date.setDate(date.getDate() + Math.floor(Math.random() * 30));
    const dateStr = date.toISOString().split('T')[0];
    
    // Random time slot
    const startHour = 9 + Math.floor(Math.random() * 8); // 9-16
    const startTime = `${startHour.toString().padStart(2, '0')}:00`;
    const endHour = startHour + 1 + Math.floor(Math.random() * 2); // 1-2 hours
    const endTime = `${endHour.toString().padStart(2, '0')}:00`;
    const duration = endHour - startHour;
    
    const subjects = mentor.mentoring_subjects || [];
    const subject = subjects[Math.floor(Math.random() * subjects.length)] || 'מתמטיקה';
    
    sessions.push({
      mentee_id: mentee.id,
      mentor_id: mentor.id,
      date: dateStr,
      start_time: startTime,
      end_time: endTime,
      duration_hours: duration,
      subject: subject,
      status: status,
      booked_by: 'mentee',
      mentee_approved: true,
      notification_dismissed_by_mentee: false,
      notification_dismissed_by_mentor: false,
      cancelled_by: status === 'rejected' ? (Math.random() > 0.5 ? 'mentor' : 'mentee') : null
    });
  }
  
  return sessions;
};

/**
 * Seed the database with sample data
 */
export const seedDatabase = async () => {
  console.log('🌱 Starting to seed database...');
  
  try {
    // Seed Mentees
    console.log('📝 Creating mentees...');
    const menteeIds = [];
    for (let i = 0; i < sampleMentees.length; i++) {
      const mentee = sampleMentees[i];
      const id = `mentee_${i + 1}`;
      const result = await setDocument('mentees', id, {
        ...mentee,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      if (result.success) {
        menteeIds.push({ ...mentee, id });
        console.log(`✅ Created mentee: ${mentee.full_name}`);
      } else {
        console.error(`❌ Failed to create mentee: ${mentee.full_name}`, result.error);
      }
    }
    
    // Seed Mentors
    console.log('👨‍🏫 Creating mentors...');
    const mentorIds = [];
    for (let i = 0; i < sampleMentors.length; i++) {
      const mentor = sampleMentors[i];
      const id = `mentor_${i + 1}`;
      const result = await setDocument('mentors', id, {
        ...mentor,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      if (result.success) {
        mentorIds.push({ ...mentor, id });
        console.log(`✅ Created mentor: ${mentor.full_name}`);
      } else {
        console.error(`❌ Failed to create mentor: ${mentor.full_name}`, result.error);
      }
    }
    
    // Seed Admins
    console.log('👤 Creating admins...');
    for (let i = 0; i < sampleAdmins.length; i++) {
      const admin = sampleAdmins[i];
      const id = `admin_${i + 1}`;
      const result = await setDocument('admins', id, {
        ...admin,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      if (result.success) {
        console.log(`✅ Created admin: ${admin.full_name}`);
      } else {
        console.error(`❌ Failed to create admin: ${admin.full_name}`, result.error);
      }
    }
    
    // Seed Sessions (only if we have mentees and mentors)
    let sessionsCreated = 0;
    if (menteeIds.length > 0 && mentorIds.length > 0) {
      console.log('📅 Creating sessions...');
      const sessions = generateSampleSessions(menteeIds, mentorIds);
      for (let i = 0; i < sessions.length; i++) {
        const session = sessions[i];
        const id = `session_${i + 1}`;
        const result = await setDocument('sessions', id, {
          ...session,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        if (result.success) {
          sessionsCreated++;
          console.log(`✅ Created session: ${session.date} ${session.start_time}`);
        } else {
          console.error(`❌ Failed to create session`, result.error);
        }
      }
    }
    
    console.log('✨ Database seeding completed!');
    console.log('\n📊 Summary:');
    console.log(`   - ${menteeIds.length} mentees`);
    console.log(`   - ${mentorIds.length} mentors`);
    console.log(`   - ${sampleAdmins.length} admins`);
    console.log(`   - ${sessionsCreated} sessions`);
    console.log('\n💡 You can now use these ID numbers to login:');
    console.log('   Mentees:', sampleMentees.map(m => m.id_number).join(', '));
    console.log('   Mentors:', sampleMentors.map(m => m.id_number).join(', '));
    console.log('   Admin:', sampleAdmins[0].id_number);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

// Export sample data for reference
export { sampleMentees, sampleMentors, sampleAdmins };

