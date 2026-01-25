const Job = require('../models/Job');

// 1. POST A JOB (Alumni Only)
exports.postJob = async (req, res) => {
    try {
        const { title, company, location, description, skills, applyLink } = req.body;

        const newJob = new Job({
            title,
            company,
            location,
            description,
            skills,
            applyLink,
            postedBy: req.user.id // Taken from Token (Middleware)
        });

        await newJob.save();
        res.status(201).json({ message: "Job Posted Successfully!" });

    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 2. GET ALL JOBS (For Feed)
exports.getAllJobs = async (req, res) => {
    try {
        // Fetch jobs and include the Name of the Alumni who posted it
        const jobs = await Job.find().populate('postedBy', 'name email').sort({ postedAt: -1 });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name email');
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.status(200).json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};