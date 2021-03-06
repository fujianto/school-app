const express = require('express');
const router = express.Router();
const Model = require('../models');
const Helper = require('../helpers/helper');

router.get('/', function (req, res) {
	Model.Subject.findAll({include: [Model.Teacher]})
		.then((allSubjects) => {

			res.render('subject', {subjects: allSubjects});
		})
		.catch(err => res.send(err.message));
})

router.get('/:subjectId/enrolledstudents', function (req, res) {
	Model.StudentSubject.findAll(
	{
		order: [ [{model: Model.Student}, 'first_name', 'ASC'] ],
		attributes: ['id', 'StudentId', 'SubjectId', 'Score'],
		where: {
			SubjectId: req.params.subjectId,
		},
		include: [{
			model: Model.Student,
		}]
	}
	).then(allStudentSubjectData => {
		Model.Subject.findOne({
			where: {
				id: req.params.subjectId,
			}
		}).then(foundSubject => {

			allStudentSubjectData.forEach( function(student, index) {
				student.scoreLetter = Helper.getScoreLetter(student.Score);
			});
			// res.send(allStudentSubjectData);
			res.render('enrolled-student', {foundSubject: foundSubject, students: allStudentSubjectData});
		}).catch(err => res.send(err));

	}).catch(err => res.send(err.message))


	/*Model.Subject.findAll({
		where: {
			id: req.params.subjectId
		},
		include: [{
			model: Model.StudentSubject,
			include: [{
				model: Model.Student
			}]
		}]
	}).then(allData => {
			res.send(allData);
			// res.render('enrolled-student', {foundSubject: allData, students: allData});
		}).catch(err => res.send(err.message));*/
})

router.get('/:subjectId/givescore', function (req, res) {
	Model.StudentSubject.findOne({
		attributes: ['id', 'StudentId', 'SubjectId', 'Score'],
		where: { id: req.params.subjectId },
		include: [
			{ model: Model.Student},
			{ model: Model.Subject}
		]
	}).then(foundStudentSubject => {
		// res.send(foundStudentSubject);
		res.render('give-score', { foundStudentSubject: foundStudentSubject})

	}).catch(err => res.send(err));

})

router.post('/:id/givescore', function(req, res) {
	Model.StudentSubject.update(
		{
			Score: req.body.Score
		},
		{
			where: {
				id: req.body.StudentSubjectId,
				StudentId: req.body.StudentId,
				SubjectId: req.body.SubjectId
			}
		})
		.then(allModelData => {
			res.redirect(`/subjects/${req.body.SubjectId}/enrolledstudents`)
		}).catch(err => res.send(err));
})

module.exports = router;