# Updated for MoviePy 2.0+
from moviepy import VideoFileClip

# Load the video file
clip = VideoFileClip("Screen Recording 2025-12-02 at 12.40.44 AM.mov")

# In v2.0, '.resize()' is now '.resized()'
clip_resized = clip.resized(width=600)

# Write the result to a gif file
clip_resized.write_gif("8_puzzle_gameplay.gif", fps=4)