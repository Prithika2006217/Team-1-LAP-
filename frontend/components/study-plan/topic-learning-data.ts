export type TopicResource = {
  title: string;
  url: string;
};

export type AssessmentQuestion = {
  question: string;
  options: string[];
  correctAnswer: number;
};

export function getTopicResource(topic: string): TopicResource {
  const query = topic.trim();

  return {
    title: `Learn ${topic.trim()}`,
    url: `https://www.freecodecamp.org/news/search/?query=${encodeURIComponent(query)}`,
  };
}