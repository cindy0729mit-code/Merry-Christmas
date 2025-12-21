import random


def dfs(matrix, src, des, vis):
    if src[0] < 0 or src[0] >= len(matrix):
        return False
    if src[1] < 0 or src[1] >= len(matrix[0]):
        return False
    i, j = src[0], src[1]
    if vis[i][j] == True:
        return False
    if src == des:
        return True
    if matrix[i][j] == 0:
        return False

    vis[i][j] = True
    if dfs(matrix, (i-1, j), des, vis) or dfs(matrix , (i + 1, j), des, vis) or dfs(matrix , (i, j - 1), des, vis) or dfs(matrix , (i, j + 1), des, vis):
        return True
    vis[i][j] = False
    return False

def maze_build():
    maze = [[0 for j in range(10)] for i in range(10)]
    # 随机选择入口和出口

    entrance = (random.choice([i for i in range(10)]), random.choice([i for i in range(10)]))
    exit = (random.choice([i for i in range(10)]), random.choice([i for i in range(10)]))
    print(f"entrance: {entrance}, exit: {exit}")
    while exit == entrance:
        exit = (random.choice([i for i in range(10)]), random.choice([i for i in range(10)]))
    for i in range(10):
        for j in range(10):
            if random.random() < 0.5:
                maze[i][j] = 1
    maze[entrance[0]][entrance[1]] = 2
    maze[exit[0]][exit[1]] = 8
    vis = [[False for j in range(10)] for i in range(10)]
    is_connected = dfs(maze, entrance, exit, vis)
    return maze, entrance, exit, is_connected



def show_maze(matrix):
    print("maze is show below...")
    for i in range(10):
        print(matrix[i])

def one_step(matrix, cur):
    option = input("please input your choose, in [W, S, A, D]: ")
    while option not in ['W', 'S', 'A', 'D']:
        option = input("please input valid operate, in [W, S, A, D]: ")
    next_step = None
    if option == 'W':
        next_step = (cur[0] -1, cur[1])
    elif option == 'S':
        next_step = (cur[0] + 1, cur[1])
    elif option == 'A':
        next_step = (cur[0], cur[1] - 1)
    elif option == 'D':
        next_step = (cur[0], cur[1] + 1)
    else:
        return None

    if next_step[0] < 0 or next_step[0] >= len(matrix) or next_step[1] < 0 or next_step[1] >= len(matrix[0]):
        print("invalid operate, must in maze inner")
        return matrix, cur
    elif matrix[next_step[0]][next_step[1]] == 0:
        print("invliad operate, next step is blocked")
        return matrix, cur
    else:
        if matrix[cur[0]][cur[1]] == 5:
            matrix[cur[0]][cur[1]] = 1
        matrix[next_step[0]][next_step[1]] = 5
        show_maze(matrix)
        return matrix, next_step


if __name__ == '__main__':
    maze, entrance, exit, is_connected = maze_build()
    show_maze(maze)
    if not is_connected:
        print("The maze is not connected from entrance to exit")
    else:
        while entrance != exit:
            maze, entrance = one_step(maze, entrance)
        print("*" * 20, "success out maze", "*" * 20)

