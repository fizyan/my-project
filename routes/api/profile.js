const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

const Profile = require('../../models/Profile');
const User = require('../../models/User');

router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate(
            'user',
            ['name', 'avatar']
        );

        if (!profile) {
            return res.sendStatus(400).json({ msg: 'There is no profile for this user' });
        }

        res.json(profile);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.post(
    '/',
    [
        auth,
        [
            check('status', 'Status is required')
                .not()
                .isEmpty(),
            check('skills', 'Skills is required')
                .not()
                .isEmpty()
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.staatus(400).json({ errors: errors.array() });
        }

        const {
            company,
            website,
            location,
            bio,
            status,
            githubusername,
            skills,
            youtube,
            facebook,
            twitter,
            instagram,
            linkedin
        } = req.body;

        const profileFields = {};
        profileFields.user = req.user.id;
        if (company) profileFields.company = company;
        if (website) profileFields.website = website;
        if (location) profileFields.location = location;
        if (bio) profileFields.bio = bio;
        if (status) profileFields.status = status;
        if (githubusername) profileFields.githubusername = githubusername;
        if (skills) {
            profileFields.skills = skills.split(',').map(skill => skill.trim());
        }

        profileFields.social = {}
        if (youtube) profileFields.social.youtube = youtube;
        if (twitter) profileFields.social.twitter = twitter;
        if (facebook) profileFields.social.facebook = facebook;
        if (linkedin) profileFields.social.linkedin = linkedini;
        if (instagram) profileFields.social.instagram = instagram;

        try {
            let profile = await Profile.findOne({ user: req.user.id });

            if (profile) {
                profile = await Profile.findOneAndUpdate(
                    { user: req.user.id },
                    { $set: profileFields },
                    { new: true }
                );

                return res.json(profile);

            }

            profile = new Profile(profileFields);

            await Profile.save();
            res.json(profile);
        }
        catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.params.user_id
        }).populate('user',
            ['name', 'avatar']);

        if (!profile) return res.status(400).json({ msg: 'Profile not found' });

        res.json(profiles);
    }
    catch (err) {
        console.error(err.message);
        if (err.kind == 'ObjectId') {
            return res.status(400).json({ msg: 'Profile not found' });
        }
        res.status(500).send('Server Error');
    }
});

router.delete('/', auth, async (req, res) => {
    try {
        await Profile.findOneAndRemove({ user: req.user.id });

        await User.findOneAndRemove({ _id: req.user.id });
        res.json({ msg: 'User deleted' });
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.put(
    '/education',
    [
        auth,
        [
            check('school', 'School is required')
                .not()
                .isEmpty(),
            check('degree', 'Degree is required')
                .not()
                .isEmpty(),
            check('fieldofstudy', 'Field of study is required')
                .not()
                .isEmpty(),
            check('from', 'From date is required')
                .not()
                .isEmpty(),
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
        } = req.body;

        const newEdu = {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
        }

        try {
            const profile = await Profile.findOne({ user: req.user.id });

            profile.education.unshift(newEdu);

            await profile.save();

            res.json(profile);
        }
        catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });

        const removeIndex = profile.education
            .map(item => item.id)
            .indexOf(req.params.edu_id);

        // Splice out of array
        profile.education.splice(removeIndex, 1);

        await profile.save();

        res.json(profile);
    }
    catch {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/github/:username', (req, res) => {
    try {
        const option = {
            uri: `https://api.github.com/users/${req.params.username
                }/repos?per_page=5&sort=created:asc&client_id=${config.get(
                    'githubClientId'
                )}&client_secert=${config.get('githubSecert')}`,
            method: 'GET',
            headers: { 'user-agent': 'node.js' }
        };
        request(options, (error, response, body) => {
            if (error) console.error(error);

            if (response.statusCode !== 200) {
                return res.status(404).json({ msg: 'No Github profile found' });
            }

            res.json(JSON.parse(body));
        });
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})

module.exports = router;