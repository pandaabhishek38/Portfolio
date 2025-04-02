import express from 'express'

const router = express.Router()

const projects = [
  {
    id: 1,
    title: 'Online Banking System',
    stack: 'Node.js, Express.js, MySQL',
    github: 'https://github.com/pandaabhishek38/Online-Banking-Application',
    description:
      'Secure banking app with real-time transactions, account management, and third-party API integration.',
  },
  {
    id: 2,
    title: 'Online Auction System',
    stack: 'Java, JSP, MySQL',
    github: 'https://github.com/pandaabhishek38/Online-Auction-System',
    description:
      'Dynamic auction platform with live bidding and secure transaction management.',
  },
  {
    id: 3,
    title: 'Plant Species Classifier',
    stack: 'Python, TensorFlow, Flask',
    github:
      'https://github.com/pandaabhishek38/Advanced-Plant-Species-Classification',
    description:
      'High-accuracy CNN model using LeNet, AlexNet, and ResNet for plant species classification.',
  },
  {
    id: 4,
    title: 'Melanoma Detection',
    stack: 'Python, PyTorch, scikit-learn',
    github:
      'https://github.com/pandaabhishek38/Melanoma-Detection-Using-Skin-Lesion-Trained-Models',
    description:
      'Deep learning models like SwinNetV2 and ResNet50 for skin lesion melanoma detection.',
  },
]

router.get('/', (req, res) => {
  res.json(projects)
})

export default router
