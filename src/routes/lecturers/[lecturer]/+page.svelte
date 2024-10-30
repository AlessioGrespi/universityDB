<script>
	import { Mail, Phone, School } from "lucide-svelte";

</script>

<div class='w-full grid grid-cols-6 pt-8 gap-8'>
    <div class='col-span-4'>
        <div class='h-full flex flex-col justify-center'>

            <h1 class="text-4xl font-semibold">Dr Peter Hubbard</h1>
            <h2 class="text-2xl font-medium text-gray-800">
                Loughborough University <span class="text-gray-400">- Wolfson School of MEME</span>
              </h2>
              <div class='my-1 flex gap-1'>
                  <h3 class=" rounded-full bg-gray-100 px-2 py-0.5 font-semibold">Control Systems Group</h3>
              </div>
        </div>
    </div>

    <div class='card col-span-2'>
        <h2 class="mb-4 text-center text-2xl font-semibold">Contact</h2>
        <table class='w-full'>
            <tbody>
                <tr class='text-lg'>
                    <td><Phone class='h-5 w-5 mx-2'/></td>
                    <td>+44 (0)1509 227157</td>
                </tr>
                <tr class='text-lg'>
                    <td><Mail class='h-5 w-5 mx-2'/></td>
                    <td>p.d.hubbard3@lboro.ac.uk</td>
                </tr>
                <tr class='text-lg'>
                    <td><School class='h-5 w-5 mx-2'/></td>
                    <td>DAV.1.021, Sir David Davies Building</td>
                </tr>
            </tbody>
        </table>
    </div>
    
    <div class='flex col-span-6 gap-8'>
        <div class='w-2/3 flex flex-col gap-8'>
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
                    <div class='col-span-2'>
                        <!-- <h3 class="mb-4 text-center text-xl font-medium">Papers</h3> -->
                        <table class='w-full'>
                            <thead class="bg-gray-100">
                                <tr>
                                    <th class='p-2'>Title</th>
                                    <th class='p-2'>Date</th>
                                </tr>
                            </thead>
                        </table>
                    </div>
                    <div class='col-span-1'>
                        <ul class='flex flex-wrap justify-center gap-1'>
                            <li class='rounded-full bg-gray-100 px-2 py-0.5 font-semibold'>Control Systems Design</li>
                            <li class='rounded-full bg-gray-100 px-2 py-0.5 font-semibold'>Avionics</li>
                            <li class='rounded-full bg-gray-100 px-2 py-0.5 font-semibold'>Kalman Filters</li>
                            <li class='rounded-full bg-gray-100 px-2 py-0.5 font-semibold'>Temperature Control</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        <div class='w-1/3 flex flex-col gap-8'>
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
