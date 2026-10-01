ALTER TABLE "Question" ADD COLUMN "difficulty" "Difficulty" NOT NULL DEFAULT 'MEDIUM'; 
CREATE INDEX "Question_difficulty_idx" ON "Question"("difficulty"); 
