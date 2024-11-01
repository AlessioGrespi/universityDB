<script>
	import { Mail, Phone, School, SquareArrowOutUpRight } from "lucide-svelte";

</script>

<div class='w-full grid grid-cols-2 sm:grid-cols-6 sm:pt-8 gap-1.5 sm:gap-6'>
    <div class='col-span-2 sm:col-span-4'>
        <div class='h-full flex flex-col justify-center'>

            <h1 class="text-base sm:text-4xl font-semibold">Dr Peter Hubbard</h1>
            <h2 class="text-sm sm:text-2xl font-medium text-gray-800">
                Loughborough University <span class="text-gray-400">- Wolfson School of MEME</span>
              </h2>
              <div class='my-1 flex gap-1'>
                  <h3 class="text-xs sm:text-base rounded-full bg-gray-100 px-2 py-0.5 font-semibold">Control Systems Group</h3>
                  <h3 class="text-xs sm:text-base rounded-full bg-gray-100 px-2 py-0.5 font-semibold"><a class='flex place-items-center' href='https://www.researchgate.net/profile/Peter-Hubbard-6'>Research Gate <SquareArrowOutUpRight class='ml-1 h-3 w-3'/></a></h3>
              </div>
        </div>
    </div>

    <div class='card col-span-2'>
        <h2 class="">Contact</h2>
        <table class='w-full'>
            <tbody>
                <tr class="text-xs sm:text-lg text-gray-700">
                    <td><Phone class='h-4 w-4 ml-2 sm:h-5 sm:w-5 sm:mx-2'/></td>
                    <td>+44 (0)1509 227157</td>
                </tr>
                <tr class="text-xs sm:text-lg text-gray-700">
                    <td><Mail class='h-4 w-4 ml-2 sm:h-5 sm:w-5 sm:mx-2'/></td>
                    <td>p.d.hubbard3@lboro.ac.uk</td>
                </tr>
                <tr class="text-xs sm:text-lg text-gray-700">
                    <td><School class='h-4 w-4 ml-2 sm:h-5 sm:w-5 sm:mx-2'/></td>
                    <td>DAV.1.021, Sir David Davies Building</td>
                </tr>
            </tbody>
        </table>
    </div>
    
    <div class='grid grid-cols-2 sm:flex col-span-2 sm:col-span-6 gap-1.5 sm:gap-8'>
        <div class='col-span-2 sm:w-2/3 flex flex-col gap-1.5 sm:gap-8'>
            <div class='card'>
                <h2 class="mb-4 text-center text-2xl font-semibold">Modules</h2>
                <table class='w-full table-auto'>
                    <thead>
                        <tr class="bg-gray-100">
                            <th class='p-2 text-center'>Code</th>
                            <th class='p-2 text-center'>Title</th>
                            <th class='p-2 text-center'>Credits</th>
                            <th class='p-2 text-center'>Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class='p-2 text-center'><a href='/modules/robotics'>24WSB104</a></td>
                            <td class='p-2 text-center'><a href='/modules/robotics'>Control System Design 1</a></td>
                            <td class='p-2 text-center'><a href='/modules/robotics'>10</a></td>
                            <td class='p-2 text-center'><a href='/modules/robotics'></a></td>
                        </tr>
                        <tr class="bg-gray-50">
                            <td class='p-2 text-center'><a href='/modules/robotics'>24WSB105</a></td>
                            <td class='p-2 text-center'><a href='/modules/robotics'>Control System Design 2</a></td>
                            <td class='p-2 text-center'><a href='/modules/robotics'>10</a></td>
                            <td class='p-2 text-center'><a href='/modules/robotics'></a></td>
                        </tr>
                        <tr>
                            <td class='p-2 text-center'><a href='/modules/robotics'>24WSC359</a></td>
                            <td class='p-2 text-center'><a href='/modules/robotics'>State Space Control</a></td>
                            <td class='p-2 text-center'><a href='/modules/robotics'>10</a></td>
                            <td class='p-2 text-center'><a href='/modules/robotics'>Module Leader</a></td>
                        </tr>
                        <tr class="bg-gray-50">
                            <td class='p-2 text-center'><a href='/modules/robotics'>24WSD527</a></td>
                            <td class='p-2 text-center'><a href='/modules/robotics'>Advanced Methods for Control</a></td>
                            <td class='p-2 text-center'><a href='/modules/robotics'>15</a></td>
                            <td class='p-2 text-center'><a href='/modules/robotics'>Module Leader</a></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class='card'>
                <h2 class="mb-4 text-center text-2xl font-semibold">Research</h2>
                <div class='w-full grid grid-cols-3 gap-4'>
                    <div class='col-span-3 sm:col-span-2'>
                        <!-- <h3 class="mb-4 text-center text-xl font-medium">Papers</h3> -->
                        <table class='w-full'>
                            <thead class="bg-gray-100">
                                <tr>
                                    <th class='p-2'>Title</th>
                                    <th class='p-2'>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class='p-2'><a href='https://www.researchgate.net/publication/384040717_Creep_slope_estimation_for_assessing_adhesion_in_the_wheelrail_contact'>Creep slope estimation for assessing adhesion in the wheel/rail contact</a></td>
                                    <td class='p-2'><a href='https://www.researchgate.net/publication/384040717_Creep_slope_estimation_for_assessing_adhesion_in_the_wheelrail_contact'>09/2024</a></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class='col-span-3 sm:col-span-1'>
                        <ul class='pill-list flex flex-wrap gap-1 justify-center'>
                            <li class=''>Control Systems Design</li>
                            <li class=''>Avionics</li>
                            <li class=''>Kalman Filters</li>
                            <li class=''>Temperature Control</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        <div class='col-span-2 grid grid-cols-2 sm:flex sm:w-1/3 flex-col gap-1.5 sm:gap-8'>
            <div class='card col-span-2'>
                <h2 class="mb-4 text-center text-2xl font-semibold row-span-1">Roles</h2>
                <table class='w-full'>
                    <tbody>
                        <tr>
                            <td>Programme Director Robotics, Mechatronics and Control Engineering</td>
                        </tr>
                        <tr>
                            <td>SMT Wolfson School of MEME</td>
                        </tr>
                        <tr>
                            <td>Lecturer in Control Systems Engineering</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class='card col-span-2'>
                <h2 class="mb-4 text-center text-2xl font-semibold">Supervised Projects</h2>
                <h3 class="mb-4 text-center text-xl font-semibold">Looking for students:</h3>
            </div>
        </div>
    </div>
</div>
