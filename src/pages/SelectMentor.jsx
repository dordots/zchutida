import React, { useState, useEffect } from 'react';
import { Mentor } from '@/api/entities';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  GraduationCap, 
  Clock, 
  Star, 
  MessageCircle,
  User,
  BookOpen,
  Building
} from 'lucide-react';

const SUBJECT_OPTIONS = [
  'מתמטיקה', 'פיזיקה', 'כימיה', 'ביולוגיה', 'מדעי המחשב',
  'אנגלית', 'עברית', 'היסטוריה', 'חשבונאות', 'כלכלה',
  'סטטיסטיקה', 'משפטים', 'פסיכולוגיה', 'הנדסה'
];

export default function SelectMentor() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedInstitution, setSelectedInstitution] = useState('all');
  const [ownMentorId, setOwnMentorId] = useState(null);
  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    // Check approval status and mentor id from localStorage
    const userData = localStorage.getItem('zchut_user');
    if (userData) {
      const parsed = JSON.parse(userData);
      // Check mentee approval status
      setIsApproved(parsed.menteeApproved === true);
      
      // Check if user is also a mentor
      if (parsed.mentorProfile) {
        setOwnMentorId(parsed.mentorProfile.id);
      } else if (parsed.type === 'mentor') {
        setOwnMentorId(parsed.profile?.id);
      }
    }
  }, []);

  // Fetch approved mentors
  const { data: mentors = [], isLoading } = useQuery({
    queryKey: ['mentors'],
    queryFn: async () => {
      const allMentors = await Mentor.filter({ 
        status: 'approved',
        available: true,
        admin_approved: true
      });
      return allMentors;
    }
  });

  // Get unique institutions for filter
  const institutions = [...new Set(mentors.map(m => m.institution).filter(Boolean))];

  // Filter mentors (exclude self if user is also a mentor)
  const filteredMentors = mentors.filter(mentor => {
    // Don't show self
    if (ownMentorId && mentor.id === ownMentorId) return false;
    
    const matchesSearch = !searchTerm || 
      mentor.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.bio?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSubject = selectedSubject === 'all' || 
      mentor.mentoring_subjects?.includes(selectedSubject);
    
    const matchesInstitution = selectedInstitution === 'all' || 
      mentor.institution === selectedInstitution;

    return matchesSearch && matchesSubject && matchesInstitution;
  });

  const handleContact = (mentor) => {
    // Open WhatsApp with mentor contact
    const message = encodeURIComponent(`שלום ${mentor.full_name}, אני מעוניין/ת בחניכה דרך זכותידע`);
    window.open(`https://wa.me/972528126679?text=${message}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center" dir="rtl">
        <div className="text-slate-600">טוען חונכים...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">חונכים זמינים</h1>
          <p className="text-slate-600">
            {isApproved 
              ? 'בחר חונך ויצור איתו קשר להתחלת החניכה'
              : 'צפה בחונכים הזמינים - לאחר אישור הזכאות תוכל ליצור קשר'}
          </p>
        </div>

        {/* Status Banner */}
        {!isApproved && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <p className="text-amber-800 font-medium">
              ⚠️ עמוד זה לצפייה בלבד - השלם את תהליך האישור כדי ליצור קשר עם חונכים
            </p>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="חיפוש לפי שם או תיאור..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>

              {/* Subject Filter */}
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="w-4 h-4 ml-2" />
                  <SelectValue placeholder="תחום לימוד" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל התחומים</SelectItem>
                  {SUBJECT_OPTIONS.map(subject => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Institution Filter */}
              <Select value={selectedInstitution} onValueChange={setSelectedInstitution}>
                <SelectTrigger className="w-full md:w-48">
                  <Building className="w-4 h-4 ml-2" />
                  <SelectValue placeholder="מוסד לימודים" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל המוסדות</SelectItem>
                  {institutions.map(inst => (
                    <SelectItem key={inst} value={inst}>{inst}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <p className="text-slate-600 mb-4">
          נמצאו {filteredMentors.length} חונכים
        </p>

        {/* Mentors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMentors.map(mentor => (
            <Card key={mentor.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-4">
                  {/* Profile Image */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center overflow-hidden">
                    {mentor.profile_image_url ? (
                      <img 
                        src={mentor.profile_image_url} 
                        alt={mentor.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{mentor.full_name}</CardTitle>
                    {mentor.institution && (
                      <p className="text-sm text-slate-600 flex items-center gap-1 mt-1">
                        <GraduationCap className="w-4 h-4" />
                        {mentor.institution}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Bio */}
                {mentor.bio && (
                  <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                    {mentor.bio}
                  </p>
                )}

                {/* Subjects */}
                {mentor.mentoring_subjects?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      תחומי חניכה:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {mentor.mentoring_subjects.map(subject => (
                        <Badge key={subject} variant="secondary" className="bg-emerald-100 text-emerald-700">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                  {mentor.experience_years && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-500" />
                      {mentor.experience_years} שנות ניסיון
                    </div>
                  )}
                  {mentor.hourly_rate && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      ₪{mentor.hourly_rate}/שעה
                    </div>
                  )}
                </div>

                {/* Contact Button */}
                {isApproved ? (
                  <Button 
                    onClick={() => handleContact(mentor)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    <MessageCircle className="w-4 h-4 ml-2" />
                    צור קשר
                  </Button>
                ) : (
                  <Button 
                    disabled
                    variant="outline"
                    className="w-full"
                  >
                    יצירת קשר זמינה לאחר אישור
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredMentors.length === 0 && (
          <div className="text-center py-12">
            <GraduationCap className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">לא נמצאו חונכים</h3>
            <p className="text-slate-500">נסה לשנות את הפילטרים או לחפש משהו אחר</p>
          </div>
        )}
      </div>
    </div>
  );
}