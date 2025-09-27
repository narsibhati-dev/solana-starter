export default function SignMessage() {
    return (
        <div className='h-full w-full rounded-lg bg-white/10 p-4 shadow-lg ring ring-neutral-700'>
            <h3 className='text-center text-lg font-bold text-purple-300'>
                Sign Message
            </h3>
            <form className='flex flex-col gap-4'>
                <div className='flex flex-col gap-2'>
                    <label htmlFor='message'>Message</label>
                    <textarea
                        name='message'
                        id='message'
                        placeholder='Message'
                        className='w-full rounded-md bg-white/5 p-2 text-white outline-none'
                    ></textarea>
                </div>
                <button
                    type='submit'
                    className='w-full cursor-pointer rounded-md bg-gradient-to-r from-purple-300 to-purple-200 px-4 py-2 font-bold text-black shadow-lg transition duration-200 hover:scale-101 disabled:cursor-not-allowed disabled:opacity-50'
                >
                    Sign Message
                </button>
            </form>

            <div className='flex flex-col gap-2 mt-4'>
                {/* <label htmlFor='signature'>Signature</label> */}
                <input
                    type='text'
                    name='signature'
                    id='signature'
                    placeholder='Signature'
                    className='w-full rounded-md bg-white/5 p-2 text-white outline-none'
                />
            </div>
        </div>
    );
}
