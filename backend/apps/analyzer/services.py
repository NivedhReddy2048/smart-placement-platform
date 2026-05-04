import os
import PyPDF2
import docx
from apps.core.models import Skill
from apps.skills.models import StudentSkill

class ResumeParser:
    @staticmethod
    def parse(file_path):
        """Extracts text from a given PDF or DOCX file."""
        if not os.path.exists(file_path):
            return ""

        ext = os.path.splitext(file_path)[1].lower()
        extracted_text = ""

        try:
            if ext == '.pdf':
                with open(file_path, 'rb') as f:
                    reader = PyPDF2.PdfReader(f)
                    for page in reader.pages:
                        extracted_text += page.extract_text() + "\n"
            elif ext in ['.doc', '.docx']:
                doc = docx.Document(file_path)
                for para in doc.paragraphs:
                    extracted_text += para.text + "\n"
        except Exception as e:
            # Depending on error tracking (e.g. sentry), we might log this
            pass

        return extracted_text


class KeywordSkillExtractor:
    @staticmethod
    def extract_and_save(resume):
        """
        Extracts skills from text using simple keyword matching
        against existing skills in the DB.
        """
        if not resume.parsed_text:
            return []

        text_lower = resume.parsed_text.lower()
        all_skills = Skill.objects.all()
        extracted_skills = []

        for skill in all_skills:
            if skill.name.lower() in text_lower:
                extracted_skills.append(skill.name)
                
                StudentSkill.objects.get_or_create(
                    student=resume.student,
                    skill=skill,
                    defaults={'proficiency': 2} # default base knowledge
                )

        return extracted_skills
