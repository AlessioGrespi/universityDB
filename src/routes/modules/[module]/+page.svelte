<script>
	import { Info } from 'lucide-svelte';
	import { onMount } from 'svelte';

	let course = {
		programData: {
			programTitle: 'Aeronautical Engineering',
			degreeAward: 'MEng (Hons) + DIS / DPS / DIntS (See programme outline for further detail)',
			length: '4 Years or 5 Years including a placement year',
			department:
				'School of Aeronautical, Automotive, Chemical and Materials Engineering / Aeronautical and Automotive Engineering',
			campus: 'Loughborough',
			degreeCode: 'TTUM01',
			ucasCode: 'H402, H403'
		}
	};

	onMount(() => {
		// You can fetch course data here if needed
	});
</script>

<svelte:head>
	<title>{course.programData.programTitle} - University Course</title>
</svelte:head>

<div class="container grid grid-cols-7 gap-6 pt-8">
	<div class="col-span-5">
		<div class="flex h-full flex-col justify-center">
			<div>
				<h1 class="text-4xl font-semibold">Control Systems Design</h1>
				<h2 class="text-2xl font-medium text-gray-800">
					Loughborough University <span class="text-gray-400"
						>- {course.programData.department}</span
					>
				</h2>
				<div class="my-1 flex gap-x-1">
					<h4 class="rounded-full bg-gray-100 px-2 py-0.5 font-medium">
						Internal Code: {course.programData.degreeCode}
					</h4>
					<h4 class="rounded-full bg-gray-100 px-2 py-0.5 font-medium">Semester 2</h4>
					<h4 class="rounded-full bg-gray-100 px-2 py-0.5 font-medium">Second Year</h4>
				</div>
			</div>
		</div>
	</div>

	<div class="card col-span-2">
		<h2 class="mb-4 text-center text-2xl font-semibold">Lecturers</h2>
		<ul class="list-none pl-0">
			<li>Pete Hubbard <span class="text-neutral-400">- Module Leader</span></li>
			<li>Paul Lepper</li>
		</ul>
	</div>
	<div class="card col-span-2">
		<h2 class="mb-4 text-center text-2xl font-semibold">Credits</h2>
		<table class="w-full">
			<tbody>
				<tr>
					<td class="p-2">Credits</td>
					<td class="p-2">20</td>
				</tr>
				<tr class="bg-gray-50">
					<td class="p-2">ECTS Credits</td>
					<td class="p-2">10</td>
				</tr>
				<tr>
					<td class="p-2">Credit Level</td>
					<td class="flex place-items-center p-2">Level 4 <Info class="ml-1 h-3 w-3" /></td>
				</tr>
			</tbody>
		</table>
	</div>

	<div class="card col-span-5">
		<h2 class="mb-4 text-center text-2xl font-semibold">Assessments</h2>
		<table class="w-full table-auto">
			<thead>
				<tr class="bg-gray-100">
					<th class="p-2 text-center" colspan="2">Type</th>
					<th class="text-nowrap p-2 text-center">% Weight</th>
					<th class="text-nowrap p-2 text-center">Length</th>
					<th class="p-2 text-center">Semester</th>
					<th class="text-nowrap p-2 text-center">Resit Available</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td class="p-2">Exam</td>
					<td class="pr-2">In-person</td>
					<td class="p-2 text-center">70</td>
					<td class="text-nowrap p-2 text-center">2 hours</td>
					<td class="p-2 text-center">S2</td>
					<td class="p-2 text-center">Yes</td>
				</tr>
				<tr class="bg-gray-50">
					<td class="p-2">Coursework</td>
					<td class="pr-2">Computer Code</td>
					<td class="p-2 text-center">30</td>
					<td class="p-2"></td>
					<td class="p-2 text-center">S2</td>
					<td class="p-2 text-center">Yes</td>
				</tr>
			</tbody>
		</table>
	</div>

	<!-- 
  <div class="card col-span-2">
    <h2 class="mb-4 text-2xl font-semibold">Assessment Methods</h2>
    <table class="w-full">
      <thead>
        <tr class="bg-gray-100">
          <th class="p-2 text-left">Method</th>
          <th class="p-2 text-left text-center">Weight</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="p-2">Exam</td>
          <td class="p-2 text-center">80%</td>
        </tr>
        <tr class="bg-gray-50">
          <td class="p-2">Coursework</td>
          <td class="p-2 text-center">20%</td>
        </tr>
      </tbody>
    </table>
  </div> -->

	<!--   
  <div class="card col-span-2">
    <h2 class="mb-4 text-center text-2xl font-semibold">Pre-requisites</h2>
    <h3 class="text-center text-xl">None</h3>
  </div> -->

	<div class="card col-span-3">
		<h2 class="mb-4 text-center text-2xl font-semibold">Content Delivery</h2>
		<table class="w-full table-auto">
			<thead>
				<tr class="bg-gray-100">
					<th class="p-2 text-left">Method</th>
					<th class="p-2 text-center">Hours</th>
					<th class="w-fill p-2 text-left">Notes</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td class="p-2">Lectures</td>
					<td class="p-2 text-center">30</td>
					<td class="w-fill p-2">Contact Time</td>
				</tr>
				<tr class="bg-gray-50">
					<td class="p-2">Tutorials</td>
					<td class="p-2 text-center">5</td>
					<td class="w-fill p-2">Contact Time</td>
				</tr>
				<tr>
					<td class="p-2">Workshops and Practicals</td>
					<td class="p-2 text-center">5</td>
					<td class="w-fill p-2">Contact Time</td>
				</tr>
				<tr class="bg-gray-50">
					<td class="p-2">Independent Study</td>
					<td class="p-2 text-center">70</td>
					<td class="w-fill"></td>
				</tr>
				<tr>
					<td class="p-2">Total</td>
					<td class="p-2 text-center">110</td>
					<td class="w-fill"></td>
				</tr>
			</tbody>
		</table>
	</div>

	<div class="card col-span-4">
		<h2 class="mb-4 text-2xl font-semibold">Module Summary</h2>
		<p>
			This module establishes the foundational principles of robotic manipulators and explores their
			kinematic and dynamic behavior. Key topics include:
		</p>
		<ul class="list-disc py-1 pl-8">
			<li>Use of vectors and matrices for spatial transformations in manipulators.</li>
			<li>Forward and inverse kinematic models and their applications.</li>
			<li>
				Analysis of velocities and forces using Jacobian transforms and dynamic behavior with
				Newton-Euler equations.
			</li>
		</ul>
		<p>
			Students will be taught through lectures and practical workshops totaling 40 hours. Assessment
			includes coursework (40%) focused on programming a robotic manipulator and an in-person exam
			(60%) evaluating theoretical knowledge.
		</p>
	</div>
	<div class="card col-span-4">
		<h2 class="mb-4 text-2xl font-semibold">Topics Covered</h2>
    <ul class='pill-list flex flex-wrap gap-1 justify-center'>
      <li>Fundamental robotic principles</li>
    <li>Kinematic and dynamic modeling</li>
    <li>Common manipulator structures</li>
    <li>Future manipulator control</li>
    <li>Vectors and matrices</li>
    <li>Forward kinematic model</li>
    <li>Inverse kinematic models</li>
    <li>Jacobian transforms analysis</li>
    <li>Dynamic behavior analysis</li>
    <li>Mathematical language modeling</li>
    <li>Kinematic properties analysis</li>
    <li>State-space equations</li>
    <li>Joint to Cartesian transformation</li>
    <li>Programming manipulators</li>
    <li>Localization and manipulation</li>
    <li>Mathematical representations</li>
    <li>Basic engineering applications</li>
    <li>Introduction to robotics</li>
    <li>Position and orientation</li>
    <li>Forward kinematics</li>
    <li>Inverse kinematics</li>
    <li>Velocities and static forces</li>
    <li>Manipulator dynamics</li>
    <li>Python for robotics</li>
    <li>Linux and ROS</li>
  </ul>
	</div>

	<div class="card col-span-3">
		<h2 class="mb-4 text-2xl font-semibold">Method of Feedback</h2>
		<ol class="list-decimal pl-4">
			<li>
				<strong>Feedback given to students in response to assessed work</strong>
				<ul class="list-disc pl-8">
					<li>Individual written feedback on coursework</li>
					<li>Model answers are posted on Learn on a weekly basis</li>
					<li>Solutions to coursework will be presented in taught periods following marking.</li>
				</ul>
			</li>
			<li>
				<strong>Developmental feedback generated through teaching activities</strong>
				<ul class="list-disc pl-8">
					<li>Dialogue between students and staff in lectures/tutorials.</li>
				</ul>
			</li>
		</ol>
	</div>
	<div class="col-span-7">
		<div class="flex flex-wrap gap-1">
			<!-- <h3 class='pill'>Fluid Dynamics</h3>
      <h3 class='pill'>MATLAB</h3>
      <h3 class='pill'>Aerospace Dynamics</h3>
      <h3 class='pill'>Sensor Fusion</h3>
      <h3 class='pill'>Unmanned Aerial Vehicles</h3>
      <h3 class='pill'>Industrial Projects</h3>
      <h3 class='pill'>Control Engineering</h3>
      <h3 class='pill'>Avionics</h3>
      <h3 class='pill'>Materials Science</h3>
      <h3 class='pill'>Mechanics</h3> -->
		</div>
	</div>

	<!-- <div class="card col-span-2">
    <h2 class="mb-4 text-center text-2xl font-semibold">Grade Boundaries</h2>
    <table class="w-full">
      <tr class="bg-gray-100">
        <th class="p-2 text-left">UK</th>
        <th class="p-2 text-left">US</th>
        <th class="p-2 text-left">Percentage</th>
      </tr>
      <tr>
        <td class="p-2">1st</td>
        <td class="p-2">?</td>
        <td class="p-2">+70%</td>
      </tr>
      <tr class="bg-gray-50">
        <td class="p-2">2:1</td>
        <td class="p-2">?</td>
        <td class="p-2">59.5% - 69.5%</td>
      </tr>
      <tr>
        <td class="p-2">2:2</td>
        <td class="p-2">?</td>
        <td class="p-2">49.5% - 59.5%</td>
      </tr>
      <tr class="bg-gray-50">
        <td class="p-2">3rd (Pass)</td>
        <td class="p-2">?</td>
        <td class="p-2">39.5% - 49.5%</td>
      </tr>
    </table>
  </div> -->
</div>

<style>
	.pill {
		@apply rounded-full bg-neutral-200 px-2 py-0.5 list-none;
	}

  .pill-list li {
    @apply rounded-full bg-neutral-200 px-2 py-0.5 w-auto capitalize;
  }
</style>
