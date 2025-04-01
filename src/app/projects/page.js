'use client'
import ProjectCard from '../../components/ProjectCard'

export default function ProjectsPage() {
  return (
    <main>
      <h1>My Projects</h1>

      <ProjectCard
        title="Online Banking System"
        techStack="Node.js, Express.js, MySQL, JavaScript, HTML, CSS"
        description="Secure banking app with JWT auth, real-time transactions, and 10+ features. Integrated Google reCAPTCHA, Twilio for SMS, SMTP for email alerts, and ATM Geolocation APIs to enhance user engagement and security."
        githubLink="https://github.com/pandaabhishek38/Online-Banking-Application"
      />

      <ProjectCard
        title="Online Auction System"
        techStack="Java, JSP, JDBC, MySQL, Apache Tomcat"
        description="Built a real-time auction platform with bid updates, order tracking, and secure transaction handling. Used database triggers and item categorization to improve adaptability and user experience."
        githubLink="https://github.com/pandaabhishek38/Online-Auction-System"
      />

      <ProjectCard
        title="Plant Species Classification with CNNs"
        techStack="Python, TensorFlow, Keras, Flask"
        description="Achieved 98.7% validation accuracy using deep CNNs (LeNet, AlexNet, ResNet) for classifying plant species. Applied image augmentation and hyperparameter tuning for optimized performance."
        githubLink="https://github.com/pandaabhishek38/Online-Auction-System"
      />

      <ProjectCard
        title="Melanoma Detection with Deep Learning"
        techStack="Python, TensorFlow, PyTorch, scikit-learn, Keras"
        description="Developed models like VGG19, ResNet50, EfficientNetV2, SwinNetV2 to detect melanoma with 96% accuracy. Applied 5-fold cross-validation and augmentation for balanced, robust detection."
        githubLink="https://github.com/pandaabhishek38/Melanoma-Detection-Using-Skin-Lesion-Trained-Models"
      />
    </main>
  )
}
