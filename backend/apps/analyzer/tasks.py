from celery import shared_task
from .models import Resume
from .services import ResumeParser, KeywordSkillExtractor

@shared_task
def parse_resume_task(resume_id):
    try:
        resume = Resume.objects.get(id=resume_id)
        
        # 1. Parse File
        extracted_text = ResumeParser.parse(resume.file.path)
        
        if extracted_text:
            resume.parsed_text = extracted_text
            resume.is_parsed = True
            resume.save()
            
            # 2. Extract Skills
            KeywordSkillExtractor.extract_and_save(resume)
            
        return f"Successfully parsed resume {resume_id}"
    except Resume.DoesNotExist:
        return f"Resume {resume_id} does not exist."
    except Exception as e:
        return f"Error parsing resume {resume_id}: {str(e)}"
